import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, ne } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers, groupObjectGrants, groups, objects } from '../../schema'
import { DB } from '../database/database.module'
import { CreateGroupDto } from './dto/create-group.dto'

@Injectable()
export class GroupsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(groups).orderBy(groups.id))
	}

	findMembers(gId: number) {
		return (this.db.select().from(groupMembers).where(eq(groupMembers.groupId, gId)))
	}

	findMy(userId: number) {
		return (this.db
			.select({ id: groups.id, name: groups.name, ownerId: groups.ownerId, role: groupMembers.role })
			.from(groupMembers)
			.innerJoin(groups, eq(groupMembers.groupId, groups.id))
			.where(eq(groupMembers.userId, userId))
			.orderBy(groups.id))
	}

	async create(dto: CreateGroupDto, adminId: number) {
		return (this.db.transaction(async (t) => {
			const [existing_group] = await t
				.select()
				.from(groups)
				.where(and(eq(groups.name, dto.name), eq(groups.ownerId, adminId)))

			if (existing_group)
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

			return (group)
		}))
	}

	async addMember(gId: number, targetUserId: number) {
		const [existing_user] = await this.db // Needed to check if user already in group
			.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),),
			)

		if (existing_user)
			throw new ForbiddenException('User already in group')

		const [member] = await this.db.insert(groupMembers).values({ groupId: gId, userId: targetUserId, role: 'member' }).returning()

		return (member)
	}

	async grantObject(gId: number, objectId: number, requesterId: number) {
		const [object] = await this.db.select().from(objects).where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException('Object not found')
		if (object.ownerId !== requesterId)
			throw new ForbiddenException('Only the object owner can grant it to a group')

		const [existing_grant] = await this.db.select().from(groupObjectGrants).where(
			and(eq(groupObjectGrants.groupId, gId), eq(groupObjectGrants.objectId, objectId),),
		)

		if (existing_grant)
			throw new ForbiddenException('Object already granted to this group')

		const [grant] = await this.db.insert(groupObjectGrants).values({
			groupId: gId,
			objectId,
			grantedBy: requesterId,
		}).returning()

		return (grant)
	}

	async updateMemberRole(gId: number, targetUserId: number, role: 'admin' | 'member') {
		const [group] = await this.db.select().from(groups).where(eq(groups.id, gId))

		if (!group)
			throw new NotFoundException('Group not found')
		if (group.ownerId === targetUserId)
			throw new ForbiddenException('Cannot change the role of the group owner')

		const [target] = await this.db.select().from(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),),
		)

		if (!target)
			throw new NotFoundException('Target user not in group')

		if (target.role === 'admin' && role === 'member') {
			const admins = await this.db.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.role, 'admin'),),
			)

			if (admins.length <= 1)
				throw new ForbiddenException('Cannot demote the only remaining admin')
		}

		const [updated] = await this.db.update(groupMembers)
			.set({ role })
			.where(and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),))
			.returning()

		return (updated)
	}

	async transferOwnership(gId: number, newOwnerId: number, requesterId: number) {
		return (this.db.transaction(async (t) => {
			const [group] = await t.select().from(groups).where(eq(groups.id, gId))

			if (!group)
				throw new NotFoundException('Group not found')
			if (group.ownerId !== requesterId)
				throw new ForbiddenException('Only the current owner can transfer ownership')
			if (newOwnerId === requesterId)
				throw new ForbiddenException('Already the owner')

			const [target] = await t.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, newOwnerId)),
			)

			if (!target)
				throw new NotFoundException('Target user is not a member of this group')

			const [updated] = await t.update(groups)
				.set({ ownerId: newOwnerId })
				.where(eq(groups.id, gId))
				.returning()

			if (target.role !== 'admin') {
				await t.update(groupMembers)
					.set({ role: 'admin' })
					.where(and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, newOwnerId)))
			}

			return (updated)
		}))
	}

	async removeMember(gId: number, targetUserId: number) {
		const [target] = await this.db.select().from(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),),
		)

		if (!target)
			throw new NotFoundException('Target user not in group')
		if (target.role == 'admin')
			throw new ForbiddenException('Cannot remove an admin')

		await this.db.delete(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),),
		)

		return ( { message: 'Member successfully removed' } )
	}

	async leaveGroup(gId: number, userId: number) {
		return (this.db.transaction(async (t) => {
			const [group] = await t.select().from(groups).where(eq(groups.id, gId))

			if (!group)
				throw new NotFoundException('Group not found')

			const [membership] = await t.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, userId),),
			)

			if (!membership)
				throw new NotFoundException('Not a member of this group')

			if (group.ownerId !== userId) {
				await t.delete(groupMembers).where(
					and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, userId),),
				)

				return ( { message: 'Left group successfully' } )
			}

			const otherMembers = await t.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), ne(groupMembers.userId, userId),),
			)

			if (otherMembers.length === 0) {
				await t.delete(groups).where(eq(groups.id, gId))

				return ( { message: 'Group deleted, you were the last member' } )
			}

			const admins = otherMembers.filter((m) => m.role === 'admin')
			const successor = (admins.length > 0 ? admins : otherMembers)
				.reduce((oldest, m) => (m.id < oldest.id ? m : oldest))

			await t.update(groups).set({ ownerId: successor.userId }).where(eq(groups.id, gId))

			if (successor.role !== 'admin') {
				await t.update(groupMembers)
					.set({ role: 'admin' })
					.where(and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, successor.userId),))
			}

			await t.delete(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, userId),),
			)

			return ( { message: 'Left group successfully' } )
		}))
	}

	async deleteGroup(gId: number, requesterId: number) {
		const [group] = await this.db.select().from(groups).where(eq(groups.id, gId))

		if (!group)
			throw new NotFoundException('Group not found')
		if (group.ownerId !== requesterId)
			throw new ForbiddenException('Only the group owner can delete this group')

		await this.db.delete(groups).where(eq(groups.id, gId))

		return ( { message: "Group successfully deleted" } )
	}
}
