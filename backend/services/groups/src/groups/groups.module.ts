import { Module } from '@nestjs/common'
import { EventPublisherService } from '@pep/shared'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'

@Module({
	controllers: [GroupsController],
	providers: [GroupsService, EventPublisherService],
	exports: [GroupsService],
})
export class GroupsModule {}