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
import { ChatsModule } from './chats/chats.module'
import { ChatsService } from './chats/chats.service'
import { userDeletedHandler } from './chats/user-deleted.handler'

@Module({
	imports: [
		DatabaseModule,
		ChatsModule,
		SharedEventsModule.register({
			imports: [ChatsModule],
			handlers: [
				defineEventHandler({
					event: EVENT.UserDeleted,
					schema: userDeletedDataSchema,
					inject: [ChatsService],
					useFactory: userDeletedHandler,
				}),
			],
		}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
