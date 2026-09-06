import { Module } from '@nestjs/common'
import { ObjectsModule } from '../objects/objects.module'
import { EventsController } from './events.controller'

@Module({
	imports: [ObjectsModule],
	controllers: [EventsController],
})
export class EventsModule {}