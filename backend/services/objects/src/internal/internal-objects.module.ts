import { Module } from '@nestjs/common'
import { InternalObjectsController } from './internal-objects.controller'
import { ObjectsModule } from '../objects/objects.module'

@Module({
	imports: [ObjectsModule],
	controllers: [InternalObjectsController],
})
export class InternalObjectsModule {}
