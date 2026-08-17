import { Inject, Injectable, NotFoundException} from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DB } from '../database/database.module'
import { and, desc, eq } from 'drizzle-orm'
import { lending } from '../database/schema'

@Injectable()
export class LendingService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	async listALL_DEBUG() {
		return (this.db.select().from(lending).orderBy(desc(lending.createdAt)));
	}
	
}