import { Logger } from '@nestjs/common'
import type { UserDeletedData } from '@pep/shared'
import { ObjectsService } from './objects.service'

export function userDeletedHandler(objects: ObjectsService) {
	const logger = new Logger('UserDeletedHandler')

	return async (data: UserDeletedData): Promise<void> => {
		const unavailable = await objects.updateAllByOwnerDeleted(data.userId)
		logger.log(`user.deleted(${data.userId}) -> marked ${unavailable} objects unavailable`)
	}
}
