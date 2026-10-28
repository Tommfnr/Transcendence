import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { UsersProxyService } from './users-proxy.service'
import { AUTH_INTERNAL_CLIENT } from './groups.tokens'

const DEFAULT_AUTH_URL = 'http://auth:3000'

@Module({
	controllers: [GroupsController],
	providers: [
		internalClientProvider(AUTH_INTERNAL_CLIENT, 'AUTH_INTERNAL_URL', DEFAULT_AUTH_URL),
		UsersProxyService,
		GroupsService,
	],
	exports: [GroupsService],
})
export class GroupsModule {}