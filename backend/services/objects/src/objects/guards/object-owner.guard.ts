import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../../database/schema'
import { DB } from '../../database/database.module'

@Injectable()
export class ObjectOwnerGuard implements CanActivate {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const objectId = Number(req.params.objectId)

		const [object] = await this.db
			.select()
			.from(objects)
			.where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)
		if (object.ownerId !== req.user.sub)
			throw new ForbiddenException('Only the object owner can do this action')

		return true
	}
}
