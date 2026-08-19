// Defines the root module AppModule that will be instantiated in main.ts

import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { ObjectsModule } from './objects/objects.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { GroupsModule } from './groups/groups.module'
import { PostsModule } from './posts/posts.module'
import { LendingModule } from './lending/lending.module'
import { APP_PIPE } from '@nestjs/core'
import { createZodValidationPipe } from 'nestjs-zod'
import { zodExceptionFactory } from './zod/zod-exception.factory'

const CustomZodPipe = createZodValidationPipe({ createValidationException: zodExceptionFactory })

@Module({
	imports: [DatabaseModule, ObjectsModule, UsersModule, AuthModule, GroupsModule, PostsModule, LendingModule],
	providers: [{ provide: APP_PIPE, useClass: CustomZodPipe }]
})
export class AppModule {}
