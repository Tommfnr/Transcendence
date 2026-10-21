// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_PIPE } from '@nestjs/core'
import {
	EVENT,
	defineEventHandler,
	SharedEventsModule,
	SharedZodValidationPipe,
	userDeletedDataSchema,
	objectDeletedDataSchema,
	postDeletedDataSchema,
} from '@pep/shared'
import { DatabaseModule } from './database/database.module'
import { LendingModule } from './lending/lending.module'
import { LendingService } from './lending/lending.service'
import { userDeletedHandler } from './lending/user-deleted.handler'
import { objectDeletedHandler } from './lending/object-deleted.handler'
import { postDeletedHandler } from './lending/post-deleted.handler'

@Module({
	imports: [
		DatabaseModule,
		ScheduleModule.forRoot(),
		LendingModule,
		SharedEventsModule.register({
			imports: [LendingModule],
			handlers: [
				defineEventHandler({
					event: EVENT.UserDeleted,
					schema: userDeletedDataSchema,
					inject: [LendingService],
					useFactory: userDeletedHandler,
				}),
				defineEventHandler({
					event: EVENT.ObjectDeleted,
					schema: objectDeletedDataSchema,
					inject: [LendingService],
					useFactory: objectDeletedHandler,
				}),
				defineEventHandler({
					event: EVENT.PostDeleted,
					schema: postDeletedDataSchema,
					inject: [LendingService],
					useFactory: postDeletedHandler,
				}),
			],
		}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
