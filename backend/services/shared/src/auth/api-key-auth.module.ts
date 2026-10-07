import { Module } from '@nestjs/common'
import { internalClientProvider } from '../http/internal-client.provider'
import { API_KEY_AUTH_CLIENT, ApiKeyGuard } from './api-key.guard'

const DEFAULT_AUTH_URL = 'http://auth:3000'

@Module({
	providers: [
		internalClientProvider(API_KEY_AUTH_CLIENT, 'AUTH_INTERNAL_URL', DEFAULT_AUTH_URL),
		ApiKeyGuard,
	],
	exports: [ApiKeyGuard, API_KEY_AUTH_CLIENT],
})
export class ApiKeyAuthModule {}
