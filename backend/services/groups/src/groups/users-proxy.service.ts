import { Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError, UserView } from '@pep/shared'
import { AUTH_INTERNAL_CLIENT } from './groups.tokens'

@Injectable()
export class UsersProxyService {
	private readonly logger = new Logger(UsersProxyService.name)

	constructor(@Inject(AUTH_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async findActiveById(id: number): Promise<UserView> {
		const user = await this.call(() => this.client.get<UserView>(`/internal/users/${id}`))
		if (!user || user.deletedAt) {
			throw new NotFoundException('User not found')
		}
		return (user)
	}

	private async call<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return (await fn())
		} catch (err) {
			if (err instanceof InternalServiceError) {
				this.logger.error(`internal call to auth failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('auth service unavailable', { cause: err })
			}
			throw err
		}
	}
}
