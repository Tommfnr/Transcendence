import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groupMembers } from '../../database/schema'
import { DB } from '../../database/database.module'
import { parseId } from '@pep/shared'

@Injectable()
export class GroupMemberGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const groupId = parseId(req.params.groupId)

		const [membership] = await this.db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, req.user.sub)))

		if (!membership)
			throw new NotFoundException('Group not found or not a member')

		return true
	}
}
