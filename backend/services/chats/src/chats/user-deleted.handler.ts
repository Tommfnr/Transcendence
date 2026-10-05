import { Logger } from '@nestjs/common'
import type { UserDeletedData } from '@pep/shared'
import { ChatsService } from './chats.service'

export function userDeletedHandler(chats: ChatsService) {
	const logger = new Logger('UserDeletedHandler')

	return async (data: UserDeletedData): Promise<void> => {
		const removed = await chats.removeForUser(data.userId)
		logger.log(`user.deleted(${data.userId}) -> removed ${removed} conversation(s)`)
	}
}
