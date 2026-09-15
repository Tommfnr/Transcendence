import { Module } from '@nestjs/common'
import { InternalGroupsController } from './internal-groups.controller'
import { GroupsModule } from '../groups/groups.module'

@Module({
	imports: [GroupsModule],
	controllers: [InternalGroupsController],
})
export class InternalGroupsModule {}
