import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groups } from '../../database/schema'
import { DB } from '../../database/database.module'
import { parseId } from '@pep/shared'

@Injectable()
export class GroupOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const groupId = parseId(req.params.groupId)

		const [group] = await this.db
			.select()
			.from(groups)
			.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))

		if (!group)
			throw new NotFoundException('Group not found')
		if (group.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the group owner can do this action')

		return true
	}
}
