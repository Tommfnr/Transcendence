// Service files defines the functions used in backend
// See : https://docs.nestjs.com/providers#services

import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, inArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects, objectGroupGrants } from '../database/schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'
import { UpdateObjectDto } from './dto/update-object.dto'
import { GroupsProxyService } from './groups-proxy.service'

@Injectable()
export class ObjectsService {
	constructor(
		@Inject(DB) private db : PostgresJsDatabase,
		private readonly groupsProxy: GroupsProxyService,
	) {}

	findAll() {
		return (this.db
				.select()
				.from(objects)
				.orderBy(objects.id))
	}

	findByUserId(userId: number) {
		return (this.db
				.select()
				.from(objects)
				.where(eq(objects.ownerId, userId))
		)
	}

	async findByIdOrThrow(objectId: number) {
		const [object] = await this.db
				.select()
				.from(objects)
				.where(eq(objects.id, objectId))

		if (!object)
			throw new NotFoundException(`Object ${objectId} not found`)

		return (object)
	}

	create(userId: number, dto: CreateObjectDto) {
		return (this.db
				.insert(objects)
				.values({ ...dto, ownerId: userId })
				.returning())
	}

	update(objectId: number, dto: UpdateObjectDto) {
		return (this.db
				.update(objects)
				.set({ ...dto, updatedAt: new Date() })
				.where(eq(objects.id, objectId))
				.returning())
	}

	async remove(objectId: number): Promise<void> {
		await this.db
				.delete(objects)
				.where(eq(objects.id, objectId))
	}

	async removeAllByOwner(ownerId: number): Promise<number> {
		const deleted = await this.db
			.delete(objects)
			.where(eq(objects.ownerId, ownerId))
			.returning({ id: objects.id })
		return (deleted.length)
	}

	async grantToGroup(objectId: number, groupId: number, grantedBy: number) {
		const isMember = await this.groupsProxy.isMemberOfAll(grantedBy, [groupId])

		if (!isMember) {
			throw new ForbiddenException('You must be a member of the target group to grant it access')
		}

		await this.db.insert(objectGroupGrants)
			.values({ objectId, groupId, grantedBy })
			.onConflictDoNothing()

		const [grant] = await this.db
			.select()
			.from(objectGroupGrants)
			.where(and(eq(objectGroupGrants.objectId, objectId), eq(objectGroupGrants.groupId, groupId)))

		return grant
	}

	async revokeFromGroup(objectId: number, groupId: number): Promise<void> {
		await this.db
			.delete(objectGroupGrants)
			.where(and(eq(objectGroupGrants.objectId, objectId), eq(objectGroupGrants.groupId, groupId)))
	}

	async findGrantedGroupIds(objectId: number) {
		return (this.db
			.select({ groupId: objectGroupGrants.groupId })
			.from(objectGroupGrants)
			.where(eq(objectGroupGrants.objectId, objectId)))
	}

	async removeAllGrantsByGroup(groupId: number): Promise<void> {
		await this.db
			.delete(objectGroupGrants)
			.where(eq(objectGroupGrants.groupId, groupId))
	}

	findObjectsGrantedToGroups(groupIds: number[]) {
		return (this.db
			.select()
			.from(objects)
			.where(
				inArray(
					objects.id,
					this.db
						.select({ id: objectGroupGrants.objectId })
						.from(objectGroupGrants)
						.where(inArray(objectGroupGrants.groupId, groupIds))
				)
			))
	}
}
