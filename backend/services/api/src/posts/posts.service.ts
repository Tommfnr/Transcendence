import { Inject, Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { posts } from '../database/schema'
import { DB } from '../database/database.module'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
	constructor(@Inject(DB) private db : PostgresJsDatabase) {}

	findAll() {
		return (this.db.select().from(posts).orderBy(posts.id))
	}

	findByUserId(userId: number) {
		return (this.db
				.select()
				.from(posts)
				.where(eq(posts.ownerId, userId)))
	}

	findOne(id: number) {
		return (this.db
				.select()
				.from(posts)
				.where(eq(posts.id, id)))
	}

	create(userId: number, dto: CreatePostDto) {
		return (this.db
				.insert(posts)
				.values( { ...dto, ownerId: userId } )
				.returning())
	}

	update(id: number, userId: number, dto: UpdatePostDto) {
		return (this.db
				.update(posts)
				.set(dto)
				.where(and(eq(posts.id, id), eq(posts.ownerId, userId)))
				.returning())
	}

	remove(id: number, userId: number) {
		return (this.db
				.delete(posts)
				.where(and(eq(posts.id, id), eq(posts.ownerId, userId))))
	}
}
