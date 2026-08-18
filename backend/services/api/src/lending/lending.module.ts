import { Module } from '@nestjs/common'
import { LendingService } from './lending.service'
import { LendingController } from './lending.controller'
import { ObjectsModule } from '../objects/objects.module'

@Module({
	controllers: [LendingController],
	providers: [LendingService],
	imports: [ObjectsModule],
})
export class LendingModule {}