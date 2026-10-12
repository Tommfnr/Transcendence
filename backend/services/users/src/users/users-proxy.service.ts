import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError, UserView } from '@pep/shared'
import { AUTH_INTERNAL_CLIENT } from './users.tokens'

@Injectable()
export class UsersProxyService {
	private readonly logger = new Logger(UsersProxyService.name)

	constructor(@Inject(AUTH_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async findAll(): Promise<UserView[]> {
		const users = await this.call(() => this.client.get<UserView[]>('/internal/users'))
		if (users === null) {
			throw new ServiceUnavailableException('auth service unavailable')
		}
		return (users)
	}

	async findById(id: number): Promise<UserView> {
		const user = await this.call(() => this.client.get<UserView>(`/internal/users/${id}`))
		if (!user) {
			throw new NotFoundException()
		}
		return (user)
	}

	async findByUsername(username: string): Promise<UserView> {
		const user = await this.call(() => this.client.get<UserView>(`/internal/users/username/${encodeURIComponent(username)}`))
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return (user)
	}

	async update(id: number, body: unknown): Promise<UserView> {
		let user: UserView | null
		try {
			user = await this.client.put<UserView>(`/internal/users/${id}`, body)
		} catch (err) {
			if (!(err instanceof InternalServiceError)) {
				throw err
			}
			if (err.status === 400) {
				throw new BadRequestException('Invalid username')
			}
			if (err.status === 409) {
				throw new ConflictException('Username already taken')
			}
			this.logger.error(`internal call to auth failed (status ${err.status}): ${err.message}`)
			throw new ServiceUnavailableException('auth service unavailable', { cause: err })
		}
		if (!user) {
			throw new NotFoundException('User not found')
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
				this.logger.error(`internal call to auth failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('auth service unavailable', { cause: err })
			}
			throw err
		}
	}
}
