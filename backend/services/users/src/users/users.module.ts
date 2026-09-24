import { Module } from '@nestjs/common'
import { internalClientProvider } from '@pep/shared'
import { UsersController } from './users.controller'
import { UsersProxyService } from './users-proxy.service'
import { AUTH_INTERNAL_CLIENT } from './users.tokens'

const DEFAULT_AUTH_URL = 'http://auth:3000'

@Module({
	controllers: [UsersController],
	providers: [
		internalClientProvider(AUTH_INTERNAL_CLIENT, 'AUTH_INTERNAL_URL', DEFAULT_AUTH_URL),
		UsersProxyService,
	],
})
export class UsersModule {}
