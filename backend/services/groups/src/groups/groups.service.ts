import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { eq, ne, and, inArray, isNull, count, countDistinct } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers, groups } from '../database/schema'
import { DB } from '../database/database.module'
import { pgErrorCode } from '@pep/shared'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'

type Executor = Pick<PostgresJsDatabase, 'select'>

@Injectable()
export class GroupsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	// Groups the user belongs to, with their role and how many members each group has
	findAll(userId: number) {
		const memberCounts = this.db
			.select({ groupId: groupMembers.groupId, memberCount: count().as('member_count') })
			.from(groupMembers)
			.groupBy(groupMembers.groupId)
			.as('member_counts')

		return this.db
			.select({
				id: groups.id,
				name: groups.name,
				description: groups.description,
				ownerId: groups.ownerId,
				role: groupMembers.role,
				memberCount: memberCounts.memberCount,
			})
			.from(groupMembers)
			.innerJoin(groups, eq(groupMembers.groupId, groups.id))
			.innerJoin(memberCounts, eq(memberCounts.groupId, groups.id))
			.where(eq(groupMembers.userId, userId))
			.orderBy(groups.id)
	}

	async findByIdOrThrow(groupId: number) {
		const [group] = await this.db
			.select()
			.from(groups)
			.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))

		if (!group)
			throw new NotFoundException('Group not found')

		return group
	}

	findByIds(groupIds: number[]) {
		return this.db
			.select({ id: groups.id, name: groups.name })
			.from(groups)
			.where(and(inArray(groups.id, groupIds), isNull(groups.deletedAt)))
	}

	findMembers(groupId: number) {
		return this.db
			.select()
			.from(groupMembers)
			.where(eq(groupMembers.groupId, groupId))
	}

	private async lockGroup(t: Executor, groupId: number) {
		const [group] = await t
			.select()
			.from(groups)
			.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))
			.for('update')

		if (!group)
			throw new NotFoundException('Group not found')

		return group
	}

	private async findMembership(groupId: number, userId: number, executor: Executor = this.db) {
		const [membership] = await executor
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))

		return membership
	}

	async stats(userId: number) {
		const myMemberships = await this.db
			.select({ groupId: groupMembers.groupId })
			.from(groupMembers)
			.where(eq(groupMembers.userId, userId))

		const myGroupIds = myMemberships.map((membership) => membership.groupId)
		const total = myGroupIds.length

		if (total === 0)
			return ({ total: 0, neighbours: 0 })

		const neighboursOfMine = await this.db
			.selectDistinct({ userId: groupMembers.userId })
			.from(groupMembers)
			.where(and(inArray(groupMembers.groupId, myGroupIds), ne(groupMembers.userId, userId),
			))

		return ({ total, neighbours: neighboursOfMine.length })
	}

	findMy(userId: number) {
		return this.db
			.select({
				id: groups.id,
				name: groups.name,
				description: groups.description,
				ownerId: groups.ownerId,
				role: groupMembers.role
			})
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

	async sharesGroup(userIds: number[], groupIds?: number[]) {
		const uniqueUserIds = [...new Set(userIds)]
		const conditions = [inArray(groupMembers.userId, uniqueUserIds)]

		if (groupIds)
			conditions.push(inArray(groupMembers.groupId, groupIds))

		const [shared] = await this.db
			.select({ groupId: groupMembers.groupId })
			.from(groupMembers)
			.where(and(...conditions))
			.groupBy(groupMembers.groupId)
			.having(eq(countDistinct(groupMembers.userId), uniqueUserIds.length))
			.limit(1)

		return shared !== undefined
	}

	async createGroup(adminId: number, dto: CreateGroupDto) {
		try {
			return await this.db.transaction(async (t) => {
				const [group] = await t
					.insert(groups)
					.values({
						name: dto.name,
						description: dto.description,
						ownerId: adminId
					})
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
		} catch (err: unknown) {
			if (pgErrorCode(err) === '23503')
				throw new UnauthorizedException('User no longer exists')
			throw err
		}
	}

	async updateGroup(groupId: number, dto: UpdateGroupDto) {
		const [updatedGroup] = await this.db
			.update(groups)
			.set({
				name: dto.name,
				description: dto.description,
				updatedAt: new Date()
			})
			.where(eq(groups.id, groupId))
			.returning()

		if (!updatedGroup)
			throw new NotFoundException('Group not found')

		return updatedGroup
	}

	async addMember(groupId: number, targetUserId: number) {
		try {
			return await this.db.transaction(async (t) => {
				await this.lockGroup(t, groupId)

				if (await this.findMembership(groupId, targetUserId, t))
					throw new ForbiddenException('User already in group')

				const [member] = await t
					.insert(groupMembers)
					.values({ groupId, userId: targetUserId, role: 'member' })
					.returning()

				return member
			})
		} catch (err: unknown) {
			const wrappedCause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined
			const cause = wrappedCause instanceof Error ? wrappedCause : err
			const code = cause instanceof Error && 'code' in cause ? cause.code : undefined

			if (code === '23503')
				throw new NotFoundException('User not found')
			if (code === '23505')
				throw new ForbiddenException('User already in group')
			throw err
		}
	}

	async updateMemberRole(groupId: number, targetUserId: number, role: 'admin' | 'member') {
		return this.db.transaction(async (t) => {
			const group = await this.lockGroup(t, groupId)

			if (group.ownerId === targetUserId)
				throw new ForbiddenException('Cannot change the role of the group owner')

			const target = await this.findMembership(groupId, targetUserId, t)

			if (!target)
				throw new NotFoundException('Target user not in group')

			if (target.role === 'admin' && role === 'member') {
				const admins = await t
					.select()
					.from(groupMembers)
					.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')))

				if (admins.length <= 1)
					throw new ForbiddenException('Cannot demote the only remaining admin')
			}

			const [updated] = await t
				.update(groupMembers)
				.set({ role, updatedAt: new Date() })
				.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
				.returning()

			return updated
		})
	}

	async removeMember(groupId: number, targetUserId: number) {
		return this.db.transaction(async (t) => {
			await this.lockGroup(t, groupId)

			const target = await this.findMembership(groupId, targetUserId, t)

			if (!target)
				throw new NotFoundException('Target user not in group')
			if (target.role == 'admin')
				throw new ForbiddenException('Cannot remove an admin')

			await t
				.delete(groupMembers)
				.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))

			return { message: 'Member successfully removed' }
		})
	}

	async leaveGroup(groupId: number, userId: number) {
		return this.db.transaction(async (t) => {
			const group = await this.lockGroup(t, groupId)

			const membership = await this.findMembership(groupId, userId, t)

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
					.update(groups)
					.set({ deletedAt: new Date(), updatedAt: new Date() })
					.where(eq(groups.id, groupId))

				await t
					.delete(groupMembers)
					.where(eq(groupMembers.groupId, groupId))

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

	// Soft delete: the group row stays, but its memberships are removed,
	// so every read that goes through group_members stops seeing it
	async deleteGroup(groupId: number) {
		await this.db.transaction(async (t) => {
			await this.lockGroup(t, groupId)

			await t
				.update(groups)
				.set({ deletedAt: new Date(), updatedAt: new Date() })
				.where(eq(groups.id, groupId))

			await t
				.delete(groupMembers)
				.where(eq(groupMembers.groupId, groupId))
		})

		return { message: 'Group successfully deleted' }
	}

	async removeMembershipsForUser(userId: number): Promise<number> {
		const ownedGroups = await this.db
			.select({ id: groups.id })
			.from(groups)
			.where(and(eq(groups.ownerId, userId), isNull(groups.deletedAt)))

		for (const group of ownedGroups)
			await this.leaveGroup(group.id, userId)

		await this.db.delete(groupMembers).where(eq(groupMembers.userId, userId))

		return (ownedGroups.length)
	}
}
