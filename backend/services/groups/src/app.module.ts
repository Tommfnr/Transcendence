// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { GroupsModule } from './groups/groups.module'
import { InternalGroupsModule } from './internal/internal-groups.module'
import {
	EVENT,
	defineEventHandler,
	SharedEventsModule,
	SharedZodValidationPipe,
	userDeletedDataSchema
} from '@pep/shared'
import { APP_PIPE } from '@nestjs/core'
import { GroupsService } from './groups/groups.service'
import { userDeletedHandler } from './groups/user-deleted.handler'

@Module({
	imports: [DatabaseModule,
						GroupsModule,
						InternalGroupsModule,
						SharedEventsModule.register({
							imports: [GroupsModule],
							handlers: [
								defineEventHandler({
									event: EVENT.UserDeleted,
									schema: userDeletedDataSchema,
									inject: [GroupsService],
									useFactory: userDeletedHandler
								}),
							],
						}),
	],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe}]
})
export class AppModule {}
