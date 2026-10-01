// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import {
	EVENT,
	defineEventHandler,
	SharedEventsModule,
	SharedZodValidationPipe,
	userDeletedDataSchema,
} from '@pep/shared'
import { DatabaseModule } from './database/database.module'
import { PostsModule } from './posts/posts.module'
import { PostsService } from './posts/posts.service'
import { userDeletedHandler } from './posts/user-deleted.handler'

@Module({
	imports: [
		DatabaseModule,
		PostsModule,
		SharedEventsModule.register({
			imports: [PostsModule],
			handlers: [
				defineEventHandler({
					event: EVENT.UserDeleted,
					schema: userDeletedDataSchema,
					inject: [PostsService],
					useFactory: userDeletedHandler,
				}),
			],
		}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
