import { Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError, PostView } from '@pep/shared'
import { POSTS_INTERNAL_CLIENT } from './lending.tokens'

const CLOSE_ATTEMPTS = 3
const CLOSE_RETRY_DELAY_MS = 200

@Injectable()
export class PostsProxyService {
	private readonly logger = new Logger(PostsProxyService.name)

	constructor(@Inject(POSTS_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async findById(id: number): Promise<PostView> {
		const post = await this.call(() => this.client.get<PostView>(`/internal/posts/${id}`))
		if (!post) {
			throw new NotFoundException('Post not found')
		}
		return (post)
	}

	async close(id: number): Promise<void> {
		for (let attempt = 1; ; attempt++) {
			try {
				await this.call(() => this.client.put(`/internal/posts/${id}/close`, {}))
				return
			} catch (err) {
				if (attempt >= CLOSE_ATTEMPTS || !(err instanceof ServiceUnavailableException))
					throw err
				await new Promise((resolve) => setTimeout(resolve, CLOSE_RETRY_DELAY_MS * attempt))
			}
		}
	}

	private async call<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return (await fn())
		} catch (err) {
			if (err instanceof InternalServiceError) {
				this.logger.error(`internal call to posts failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('posts service unavailable', { cause: err })
			}
			throw err
		}
	}
}
