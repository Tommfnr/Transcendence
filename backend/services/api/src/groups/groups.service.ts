import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, ne, and, inArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers, groups } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'

@Injectable()
export class GroupsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return this.db
			.select()
			.from(groups)
			.orderBy(groups.id)
	}

	async findOne(groupId: number) {
		const [group] = await this.db
			.select()
			.from(groups)
			.where(eq(groups.id, groupId))

		if (!group)
			throw new NotFoundException('Group not found')

		return group
	}

	findMembers(groupId: number) {
		return this.db
			.select()
			.from(groupMembers)
			.where(eq(groupMembers.groupId, groupId))
	}

	async findMembership(groupId: number, userId: number) {
		const [membership] = await this.db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

		return membership
	}

	findMy(userId: number) {
		return this.db
			.select({ id: groups.id, name: groups.name, description: groups.description, ownerId: groups.ownerId, role: groupMembers.role })
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
				.values({ name: dto.name, description: dto.description, ownerId: adminId })
				.returning()

			await t
				.insert(groupMembers)
				.values({
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
				.set({ name: dto.name, description: dto.description, updatedAt: new Date() })
				.where(eq(groups.id, groupId))
				.returning()

			return updated
		})
	}

	async addMember(groupId: number, targetUserId: number) {
		const existingUser = await this.findMembership(groupId, targetUserId)

		if (existingUser)
			throw new ForbiddenException('User already in group')

		const [member] = await this.db
			.insert(groupMembers)
			.values({ groupId, userId: targetUserId, role: 'member' })
			.returning()

		return member
	}

	async updateMemberRole(groupId: number, targetUserId: number, role: 'admin' | 'member') {
		const group = await this.findOne(groupId)

		if (group.ownerId === targetUserId)
			throw new ForbiddenException('Cannot change the role of the group owner')

		const target = await this.findMembership(groupId, targetUserId)

		if (!target)
			throw new NotFoundException('Target user not in group')

		if (target.role === 'admin' && role === 'member') {
			const admins = await this.db
				.select()
				.from(groupMembers)
				.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')))

			if (admins.length <= 1)
				throw new ForbiddenException('Cannot demote the only remaining admin')
		}

		const [updated] = await this.db
			.update(groupMembers)
			.set({ role, updatedAt: new Date() })
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
			.returning()

		return updated
	}

	async removeMember(groupId: number, targetUserId: number) {
		const target = await this.findMembership(groupId, targetUserId)

		if (!target)
			throw new NotFoundException('Target user not in group')
		if (target.role == 'admin')
			throw new ForbiddenException('Cannot remove an admin')

		await this.db
			.delete(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))

		return { message: 'Member successfully removed' }
	}

	async leaveGroup(groupId: number, userId: number) {
		return this.db.transaction(async (t) => {
			const group = await this.findOne(groupId)

			const membership = await this.findMembership(groupId, userId)

			if (!membership)
				throw new NotFoundException('Not a member of this group')

			if (group.ownerId !== userId) {
				await t
					.delete(groupMembers)
					.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

				return { message: 'Left group successfully' }
			}

			const [successor] = await t
				.select()
				.from(groupMembers)
				.where(and(eq(groupMembers.groupId, groupId), ne(groupMembers.userId, userId)))
				.orderBy(groupMembers.id)
				.limit(1)

			if (!successor) {
				await t
					.delete(groups)
					.where(eq(groups.id, groupId))

				return { message: 'Group deleted, you were the last member' }
			}

			await t
				.update(groups)
				.set({ ownerId: successor.userId })
				.where(eq(groups.id, groupId))

			await t
				.update(groupMembers)
				.set({ role: 'admin' })
				.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, successor.userId)))

			await t
				.delete(groupMembers)
				.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

			return { message: 'Left group successfully' }
		})
	}

	async deleteGroup(groupId: number, requesterId: number) {
		const group = await this.findOne(groupId)

		if (group.ownerId !== requesterId)
			throw new ForbiddenException('Only the group owner can delete this group')

		await this.db
			.delete(groups)
			.where(eq(groups.id, groupId))

		return { message: 'Group successfully deleted' }
	}
}
