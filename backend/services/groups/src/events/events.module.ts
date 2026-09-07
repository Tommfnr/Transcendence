import { Module } from '@nestjs/common'
import { GroupsModule } from '../groups/groups.module'
import { EventsController } from './events.controller'

@Module({
	imports: [GroupsModule],
	controllers: [EventsController],
})
export class EventsModule {}