import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { EventsModule } from '../events/events.module'

@Module({
	imports: [EventsModule],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
