// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ObjectsModule } from './objects/objects.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { GroupsModule } from './groups/groups.module'

@Module({
	imports: [DatabaseModule, ObjectsModule, UsersModule, AuthModule, GroupsModule],
})
export class AppModule {}