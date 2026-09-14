// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { SharedZodValidationPipe } from '@pep/shared'
import { DatabaseModule } from './database/database.module'
import { LendingModule } from './lending/lending.module'

@Module({
	imports: [DatabaseModule, LendingModule],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
