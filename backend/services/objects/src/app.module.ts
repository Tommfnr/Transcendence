// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ObjectsModule } from './objects/objects.module'
import { EventsModule } from './events/events.module'
import { SharedZodValidationPipe } from '@pep/shared'
import { APP_PIPE } from '@nestjs/core'

@Module({
	imports: [DatabaseModule, ObjectsModule, EventsModule],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe}]
})
export class AppModule {}
