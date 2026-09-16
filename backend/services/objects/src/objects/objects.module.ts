// Modules are used to organize and manage the application stucture efficiently (i.e. separating controller from service)
// See : https://docs.nestjs.com/modules

import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { ObjectsController } from './objects.controller'
import { ObjectsService } from './objects.service'
import { GroupsProxyService } from './groups-proxy.service'
import { GROUPS_INTERNAL_CLIENT } from './objects.tokens'

const DEFAULT_GROUPS_URL = 'http://groups:3000'

@Module({
	controllers: [ObjectsController],
	providers: [
		internalClientProvider(GROUPS_INTERNAL_CLIENT, 'GROUPS_INTERNAL_URL', DEFAULT_GROUPS_URL),
		GroupsProxyService,
		ObjectsService,
	],
	exports: [ObjectsService],
})
export class ObjectsModule {}
