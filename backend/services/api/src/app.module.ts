// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ObjectsModule } from './objects/objects.module'
import { GroupsModule } from './groups/groups.module'
import { LendingModule } from './lending/lending.module'
import { JwtModule } from '@nestjs/jwt'
import { APP_PIPE } from '@nestjs/core'
import { SharedZodValidationPipe } from '@pep/shared'

@Module({
	imports: [DatabaseModule, ObjectsModule, GroupsModule, LendingModule, JwtModule.register({ global: true })],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }]
})
export class AppModule {}