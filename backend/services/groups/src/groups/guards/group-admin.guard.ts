import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers } from '../../database/schema'
import { DB } from '../../database/database.module'

@Injectable()
export class GroupAdminGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const groupId = Number(req.params.groupId)

		if (!Number.isInteger(groupId))
			throw new BadRequestException('Invalid group id')

		const [membership] = await this.db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, req.user.sub)))

		if (!membership)
			throw new NotFoundException('Group not found or not a member')
		if (membership.role !== 'admin')
			throw new ForbiddenException('Admin role needed for this action')

		return true
	}
}
