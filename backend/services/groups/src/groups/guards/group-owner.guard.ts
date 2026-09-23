import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { groups } from '../../database/schema'
import { DB } from '../../database/database.module'

@Injectable()
export class GroupOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const groupId = Number(req.params.groupId)

		if (!Number.isInteger(groupId))
			throw new BadRequestException('Invalid group id')

		const [group] = await this.db
			.select()
			.from(groups)
			.where(eq(groups.id, groupId))

		if (!group)
			throw new NotFoundException('Group not found')
		if (group.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the group owner can do this action')

		return true
	}
}
