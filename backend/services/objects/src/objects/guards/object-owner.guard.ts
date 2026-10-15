import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../../database/schema'
import { DB } from '../../database/database.module'
import { parseId } from '@pep/shared'

@Injectable()
export class ObjectOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const objectId = parseId(req.params.objectId)

		const [object] = await this.db
			.select()
			.from(objects)
			.where(and(eq(objects.id, objectId), isNull(objects.deletedAt)))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)
		if (object.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the object owner can do this action')

		return true
	}
}
