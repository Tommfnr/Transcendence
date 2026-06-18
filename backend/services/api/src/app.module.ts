// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ObjectsModule } from './objects/objects.module'

@Module({
	imports: [DatabaseModule, ObjectsModule],
})
export class AppModule {}