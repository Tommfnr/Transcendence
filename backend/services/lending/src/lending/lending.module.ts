import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { LendingService } from './lending.service'
import { LendingController } from './lending.controller'
import { ObjectsProxyService } from './objects-proxy.service'
import { PostsProxyService } from './posts-proxy.service'
import { OBJECTS_INTERNAL_CLIENT, POSTS_INTERNAL_CLIENT } from './lending.tokens'

const DEFAULT_OBJECTS_URL = 'http://objects:3000'
const DEFAULT_POSTS_URL = 'http://posts:3000'

@Module({
	controllers: [LendingController],
	providers: [
		internalClientProvider(OBJECTS_INTERNAL_CLIENT, 'OBJECTS_INTERNAL_URL', DEFAULT_OBJECTS_URL),
		internalClientProvider(POSTS_INTERNAL_CLIENT, 'POSTS_INTERNAL_URL', DEFAULT_POSTS_URL),
		ObjectsProxyService,
		PostsProxyService,
		LendingService,
	],
	exports: [LendingService],
})
export class LendingModule {}
