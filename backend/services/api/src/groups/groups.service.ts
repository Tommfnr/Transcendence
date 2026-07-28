import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers, groups } from '../../schema'
import { DB } from '../database/database.module'
import { CreateGroupDto } from './dto/creategroup.dto'

@Injectable()
export class GroupsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async create(dto: CreateGroupDto, adminId: number) {

		const [existing_group] = await this.db.select().from(groups).where(eq(groups.name, dto.name))

		if (existing_group)
				throw new ForbiddenException('Already a group with the same name')

		const [group] = await this.db.insert(groups).values({ name: dto.name }).returning()

		await this.db.insert(groupMembers).values({ groupId: group.id, userId: adminId, role: 'admin' })
	
		return (group)
	}

	findAll() {
		return (this.db.select().from(groups).orderBy(groups.id))
	}

	findMembers(gId: number) {
		return (this.db.select().from(groupMembers).where(eq(groupMembers.groupId, gId)))
	}

	async addMember(gId: number, targetUserId: number, requesterId: number) {
		const [requester] = await this.db.select().from(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, requesterId),),
		)

		if (!requester)
			throw new NotFoundException('Group not found or not a member')
		if (requester.role != 'admin')
			throw new ForbiddenException('Admin role needed for this action')
	
		const [existing_user] = await this.db // Needed to check if user already in group
			.select().from(groupMembers).where(
				and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, targetUserId),),
			)
		
		if (existing_user)
			throw new ForbiddenException('User already in group')

		const [member] = await this.db.insert(groupMembers).values({ groupId: gId, userId: targetUserId, role: 'member' }).returning()

		return (member)
	}

	async removeMember(gId: number, targetUserId: number, requesterId: number) {
		const [requester] = await this.db.select().from(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, requesterId),),
		)

		if (!requester)
			throw new NotFoundException('Group not found or not a member')
		if (requester.role != 'admin')
			throw new ForbiddenException('Admin role needed for this action')

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

	async deleteGroup(gId: number, requesterId: number) {
		const [requester] = await this.db.select().from(groupMembers).where(
			and(eq(groupMembers.groupId, gId), eq(groupMembers.userId, requesterId),),
		)

		if (!requester)
			throw new NotFoundException('Group not found or not a member')
		if (requester.role != 'admin')
			throw new ForbiddenException('Admin role needed for this action')

		await this.db.delete(groups).where(eq(groups.id, gId))
		
		return ( { message: "Group successfully deleted" } )
	}
}