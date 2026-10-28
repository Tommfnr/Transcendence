import { Module } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { SharedZodValidationPipe } from '@pep/shared'
import { UsersModule } from './users/users.module'

@Module({
	imports: [UsersModule],
	providers: [{ provide: APP_PIPE, useClass: SharedZodValidationPipe }],
})
export class AppModule {}
