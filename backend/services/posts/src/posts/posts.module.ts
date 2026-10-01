import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'
import { GroupsProxyService } from './groups-proxy.service'
import { GROUPS_INTERNAL_CLIENT } from './posts.tokens'

const DEFAULT_GROUPS_URL = 'http://groups:3000'

@Module({
	controllers: [PostsController],
	providers: [
		internalClientProvider(GROUPS_INTERNAL_CLIENT, 'GROUPS_INTERNAL_URL', DEFAULT_GROUPS_URL),
		GroupsProxyService,
		PostsService,
	],
	exports: [PostsService],
})
export class PostsModule {}
