import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, ne, and, inArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers, groupObjectGrants, groups, objects } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'

@Injectable()
export class GroupsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return this.db.select().from(groups).orderBy(groups.id)
	}

	async findOne(groupId: number) {
		const [group] = await this.db.select().from(groups).where(eq(groups.id, groupId))

		if (!group)
			throw new NotFoundException('Group not found')

		return group
	}

	findMembers(groupId: number) {
		return this.db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId))
	}

	async findMembership(groupId: number, userId: number) {
		const [membership] = await this.db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

		return membership
	}

	findGrantedObjects(groupId: number) {
		return this.db
			.select({
				id: objects.id,
				brand: objects.brand,
				type: objects.type,
				description: objects.description,
				ownerId: objects.ownerId,
				isAvailable: objects.isAvailable,
				grantedBy: groupObjectGrants.grantedBy,
			})
			.from(groupObjectGrants)
			.innerJoin(objects, eq(groupObjectGrants.objectId, objects.id))
			.where(eq(groupObjectGrants.groupId, groupId))
	}

	findMy(userId: number) {
		return this.db
			.select({ id: groups.id, name: groups.name, ownerId: groups.ownerId, role: groupMembers.role })
			.from(groupMembers)
			.innerJoin(groups, eq(groupMembers.groupId, groups.id))
			.where(eq(groupMembers.userId, userId))
			.orderBy(groups.id)
	}

	async isMemberOfAll(userId: number, groupIds: number[]) {
		const memberships = await this.db
			.select({ groupId: groupMembers.groupId })
			.from(groupMembers)
			.where(and(eq(groupMembers.userId, userId), inArray(groupMembers.groupId, groupIds)))

		return memberships.length === groupIds.length
	}

	async create(dto: CreateGroupDto, adminId: number) {
		return this.db.transaction(async (t) => {
			const [existingGroup] = await t
				.select()
				.from(groups)
				.where(and(eq(groups.name, dto.name), eq(groups.ownerId, adminId)))

			if (existingGroup)
				throw new ForbiddenException('Already a group with the same name')

			const [group] = await t
				.insert(groups)
				.values({ name: dto.name, ownerId: adminId })
				.returning()

			await t.insert(groupMembers).values({
				groupId: group.id,
				userId: adminId,
				role: 'admin',
			})

			return group
		})
	}

	async update(groupId: number, dto: UpdateGroupDto) {
		return this.db.transaction(async (t) => {
			const group = await this.findOne(groupId)

			const [existingGroup] = await t
				.select()
				.from(groups)
				.where(and(eq(groups.ownerId, group.ownerId), eq(groups.name, dto.name), ne(groups.id, groupId)))

			if (existingGroup)
				throw new ForbiddenException('Already a group with the same name')

			const [updated] = await t
				.update(groups)
				.set({ name: dto.name })
				.where(eq(groups.id, groupId))
				.returning()

			return updated
		})
	}

	async addMember(groupId: number, targetUserId: number) {
		const existingUser = await this.findMembership(groupId, targetUserId)

		if (existingUser)
			throw new ForbiddenException('User already in group')

		const [member] = await this.db.insert(groupMembers).values({ groupId, userId: targetUserId, role: 'member' }).returning()

		return member
	}

	async grantObject(groupId: number, objectId: number, requesterId: number) {
		const [object] = await this.db.select().from(objects).where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException('Object not found')
		if (object.ownerId !== requesterId)
			throw new ForbiddenException('Only the object owner can grant it to a group')

		const [existingGrant] = await this.db.select().from(groupObjectGrants).where(and(eq(groupObjectGrants.groupId, groupId), eq(groupObjectGrants.objectId, objectId)))

		if (existingGrant)
			throw new ForbiddenException('Object already granted to this group')

		const [grant] = await this.db.insert(groupObjectGrants).values({
			groupId,
			objectId,
			grantedBy: requesterId,
		}).returning()

		return grant
	}

	async revokeObject(groupId: number, objectId: number, requesterId: number) {
		const [object] = await this.db.select().from(objects).where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException('Object not found')
		if (object.ownerId !== requesterId)
			throw new ForbiddenException('Only the object owner can revoke it from a group')

		const [existingGrant] = await this.db.select().from(groupObjectGrants).where(and(eq(groupObjectGrants.groupId, groupId), eq(groupObjectGrants.objectId, objectId)))

		if (!existingGrant)
			throw new NotFoundException('Object not granted to this group')

		await this.db.delete(groupObjectGrants).where(and(eq(groupObjectGrants.groupId, groupId), eq(groupObjectGrants.objectId, objectId)))

		return { message: 'Object grant revoked' }
	}

	async updateMemberRole(groupId: number, targetUserId: number, role: 'admin' | 'member') {
		const group = await this.findOne(groupId)

		if (group.ownerId === targetUserId)
			throw new ForbiddenException('Cannot change the role of the group owner')

		const target = await this.findMembership(groupId, targetUserId)

		if (!target)
			throw new NotFoundException('Target user not in group')

		if (target.role === 'admin' && role === 'member') {
			const admins = await this.db.select().from(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')))

			if (admins.length <= 1)
				throw new ForbiddenException('Cannot demote the only remaining admin')
		}

		const [updated] = await this.db.update(groupMembers)
			.set({ role })
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
			.returning()

		return updated
	}

	async transferOwnership(groupId: number, newOwnerId: number, requesterId: number) {
		return this.db.transaction(async (t) => {
			const group = await this.findOne(groupId)

			if (group.ownerId !== requesterId)
				throw new ForbiddenException('Only the current owner can transfer ownership')
			if (newOwnerId === requesterId)
				throw new ForbiddenException('Already the owner')

			const target = await this.findMembership(groupId, newOwnerId)

			if (!target)
				throw new NotFoundException('Target user is not a member of this group')

			const [updated] = await t.update(groups)
				.set({ ownerId: newOwnerId })
				.where(eq(groups.id, groupId))
				.returning()

			if (target.role !== 'admin') {
				await t.update(groupMembers)
					.set({ role: 'admin' })
					.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, newOwnerId)))
			}

			return updated
		})
	}

	async removeMember(groupId: number, targetUserId: number) {
		const target = await this.findMembership(groupId, targetUserId)

		if (!target)
			throw new NotFoundException('Target user not in group')
		if (target.role == 'admin')
			throw new ForbiddenException('Cannot remove an admin')

		await this.db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))

		return { message: 'Member successfully removed' }
	}

	async leaveGroup(groupId: number, userId: number) {
		return this.db.transaction(async (t) => {
			const group = await this.findOne(groupId)

			const membership = await this.findMembership(groupId, userId)

			if (!membership)
				throw new NotFoundException('Not a member of this group')

			if (group.ownerId !== userId) {
				await t.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

				return { message: 'Left group successfully' }
			}

			const otherMembers = await t.select().from(groupMembers).where(and(eq(groupMembers.groupId, groupId), ne(groupMembers.userId, userId)))

			if (otherMembers.length === 0) {
				await t.delete(groups).where(eq(groups.id, groupId))

				return { message: 'Group deleted, you were the last member' }
			}

			const admins = otherMembers.filter((m) => m.role === 'admin')

			let candidates = otherMembers
			if (admins.length > 0)
				candidates = admins

			let successor = candidates[0]
			for (const m of candidates) {
				if (m.id < successor.id)
					successor = m
			}

			await t.update(groups).set({ ownerId: successor.userId }).where(eq(groups.id, groupId))

			if (successor.role !== 'admin') {
				await t.update(groupMembers)
					.set({ role: 'admin' })
					.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, successor.userId)))
			}

			await t.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

			return { message: 'Left group successfully' }
		})
	}

	async deleteGroup(groupId: number, requesterId: number) {
		const group = await this.findOne(groupId)

		if (group.ownerId !== requesterId)
			throw new ForbiddenException('Only the group owner can delete this group')

		await this.db.delete(groups).where(eq(groups.id, groupId))

		return { message: 'Group successfully deleted' }
	}
}
