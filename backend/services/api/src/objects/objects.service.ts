// Service files defines the functions used in backend
// See : https://docs.nestjs.com/providers#services

import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../../schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'

@Injectable()
export class ObjectsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(objects).orderBy(objects.id))
	}

	create(dto: CreateObjectDto) {
		return (this.db.insert(objects).values(dto).returning())
	}

	remove(id: number) {
		return (this.db.delete(objects).where(eq(objects.id, id)))
	}
}