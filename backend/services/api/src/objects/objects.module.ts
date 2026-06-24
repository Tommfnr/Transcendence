// Modules are used to organize and manage the application stucture efficiently (i.e. separating controller from service)
// See : https://docs.nestjs.com/modules

import { Module } from '@nestjs/common'
import { ObjectsController } from './objects.controller'
import { ObjectsService } from './objects.service'

@Module({
	controllers: [ObjectsController],
	providers: [ObjectsService],
})
export class ObjectsModule {}
