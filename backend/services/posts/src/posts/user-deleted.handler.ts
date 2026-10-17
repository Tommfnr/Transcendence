import { Logger } from '@nestjs/common'
import type { UserDeletedData } from '@pep/shared'
import { PostsService } from './posts.service'

export function userDeletedHandler(posts: PostsService) {
	const logger = new Logger('UserDeletedHandler')

	return async (data: UserDeletedData): Promise<void> => {
		const closed = await posts.updateAllByOwnerDeleted(data.userId)
		logger.log(`user.deleted(${data.userId}) -> deleted ${closed} posts`)
	}
}
