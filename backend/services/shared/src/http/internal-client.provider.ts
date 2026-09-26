import { Provider } from '@nestjs/common'
import { optionalEnv, requireEnv } from '../config/env'
import { InternalServiceClient } from './internal-client'

export function internalClientProvider(
	token: string | symbol,
	urlEnvVar: string,
	fallbackUrl: string,
): Provider {
	return {
		provide: token,
		useFactory: () =>
			new InternalServiceClient({
				baseUrl: optionalEnv(urlEnvVar, fallbackUrl),
				apiKey: requireEnv('INTERNAL_API_KEY'),
			}),
	}
}
