import { Logger } from '@nestjs/common'
import type { PostDeletedData } from '@pep/shared'
import { LendingService } from './lending.service'

export function postDeletedHandler(lending: LendingService) {
	const logger = new Logger('PostDeletedHandler')

	return async (data: PostDeletedData): Promise<void> => {
		const cancelled = await lending.updateAllForPostDeleted(data.postId)
		logger.log(`post.deleted(${data.postId}) -> cancelled ${cancelled} lending row(s)`)
	}
}
