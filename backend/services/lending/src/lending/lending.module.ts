import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { LendingService } from './lending.service'
import { LendingController } from './lending.controller'
import { ObjectsProxyService } from './objects-proxy.service'
import { PostsProxyService } from './posts-proxy.service'
import { GroupsProxyService } from './groups-proxy.service'
import { GROUPS_INTERNAL_CLIENT, OBJECTS_INTERNAL_CLIENT, POSTS_INTERNAL_CLIENT } from './lending.tokens'
import { OverdueJob } from './overdue.job'

const DEFAULT_OBJECTS_URL = 'http://objects:3000'
const DEFAULT_POSTS_URL = 'http://posts:3000'
const DEFAULT_GROUPS_URL = 'http://groups:3000'

@Module({
	controllers: [LendingController],
	providers: [
		internalClientProvider(OBJECTS_INTERNAL_CLIENT, 'OBJECTS_INTERNAL_URL', DEFAULT_OBJECTS_URL),
		internalClientProvider(POSTS_INTERNAL_CLIENT, 'POSTS_INTERNAL_URL', DEFAULT_POSTS_URL),
		internalClientProvider(GROUPS_INTERNAL_CLIENT, 'GROUPS_INTERNAL_URL', DEFAULT_GROUPS_URL),
		ObjectsProxyService,
		PostsProxyService,
		GroupsProxyService,
		LendingService,
		OverdueJob,
	],
	exports: [LendingService],
})
export class LendingModule {}
