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
import { LendingModule } from './lending/lending.module'
import { LendingService } from './lending/lending.service'
import { userDeletedHandler } from './lending/user-deleted.handler'

@Module({
	imports: [
		DatabaseModule,
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
			],
		}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
