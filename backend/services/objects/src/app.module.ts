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
import { ObjectsModule } from './objects/objects.module'
import { ObjectsService } from './objects/objects.service'
import { userDeletedHandler } from './objects/user-deleted.handler'

@Module({
	imports: [
		DatabaseModule,
		ObjectsModule,
		SharedEventsModule.register({
			imports: [ObjectsModule],
			handlers: [
				defineEventHandler({
					event: EVENT.UserDeleted,
					schema: userDeletedDataSchema,
					inject: [ObjectsService],
					useFactory: userDeletedHandler,
				}),
			],
		}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
