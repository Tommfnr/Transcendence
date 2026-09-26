import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { conversationMembers } from '../../database/schema'
import { DB } from '../../database/database.module'
import { parseId } from '@pep/shared'

@Injectable()
export class ConversationMemberGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const conversationId = parseId(req.params.conversationId)

		const [membership] = await this.db
			.select()
			.from(conversationMembers)
			.where(and(eq(conversationMembers.conversationId, conversationId), eq(conversationMembers.userId, req.user.sub)))

		if (!membership)
			throw new NotFoundException('Conversation not found or not a member')

		return true
	}
}
