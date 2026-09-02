import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { InternalUsersModule } from './internal/internal-users.module'
import { APP_PIPE } from '@nestjs/core'
import { SharedZodValidationPipe } from '@pep/shared'

@Module({
	imports: [DatabaseModule, UsersModule, AuthModule, InternalUsersModule],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
