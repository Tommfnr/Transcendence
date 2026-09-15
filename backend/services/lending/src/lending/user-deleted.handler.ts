import { Logger } from '@nestjs/common'
import type { UserDeletedData } from '@pep/shared'
import { LendingService } from './lending.service'

export function userDeletedHandler(lending: LendingService) {
	const logger = new Logger('UserDeletedHandler')

	return async (data: UserDeletedData): Promise<void> => {
		const removed = await lending.removeForUser(data.userId)
		logger.log(`user.deleted(${data.userId}) -> removed ${removed} lending row(s)`)
	}
}
