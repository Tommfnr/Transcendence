import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import { ChatsGateway } from './chats.gateway'
import { UsersProxyService } from './users-proxy.service'
import { AUTH_INTERNAL_CLIENT } from './chats.tokens'

const DEFAULT_AUTH_URL = 'http://auth:3000'

@Module({
	controllers: [ChatsController],
	providers: [
		internalClientProvider(AUTH_INTERNAL_CLIENT, 'AUTH_INTERNAL_URL', DEFAULT_AUTH_URL),
		UsersProxyService,
		ChatsService,
		ChatsGateway,
	],
	exports: [ChatsService],
})
export class ChatsModule {}
