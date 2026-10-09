// Modules are used to organize and manage the application stucture efficiently (i.e. separating controller from service)
// See : https://docs.nestjs.com/modules

import { Module } from '@nestjs/common'
import { ApiKeyAuthModule } from '@pep/shared'
import { ObjectsController } from './objects.controller'
import { PublicObjectsController } from './public-objects.controller'
import { ObjectsService } from './objects.service'

@Module({
	imports: [ApiKeyAuthModule],
	controllers: [ObjectsController, PublicObjectsController],
	providers: [ObjectsService],
	exports: [ObjectsService],
})
export class ObjectsModule {}
