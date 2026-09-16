import { Module } from '@nestjs/common'
import { EventPublisherService } from '@pep/shared'
import { UsersService } from './users.service'

@Module({
	providers: [UsersService, EventPublisherService],
	exports: [UsersService],
})
export class UsersModule {}
