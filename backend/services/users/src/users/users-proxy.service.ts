import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError, requireEnv } from '@pep/shared'

export interface UserView {
	id: number
	username: string
	email: string
}

const DEFAULT_AUTH_URL = 'http://auth:3000'

@Injectable()
export class UsersProxyService {
	private readonly client: InternalServiceClient

	constructor() {
		this.client = new InternalServiceClient({
			baseUrl: process.env.AUTH_INTERNAL_URL ?? DEFAULT_AUTH_URL,
			apiKey: requireEnv('INTERNAL_API_KEY'),
		})
	}

	async findAll(): Promise<UserView[]> {
		const users = await this.call(() => this.client.get<UserView[]>('/internal/users'))
		return (users ?? [])
	}

	async findById(id: number): Promise<UserView> {
		const user = await this.call(() => this.client.get<UserView>(`/internal/users/${id}`))
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	async remove(id: number): Promise<void> {
		await this.call(() => this.client.delete(`/internal/users/${id}`))
	}

	private async call<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return (await fn())
		} catch (err) {
			if (err instanceof InternalServiceError) {
				throw new ServiceUnavailableException('auth service unavailable')
			}
			throw err
		}
	}
}
