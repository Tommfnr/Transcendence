// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'

@Module({
	imports: [DatabaseModule],
})
export class AppModule {}
