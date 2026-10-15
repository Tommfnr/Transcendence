import { Logger } from '@nestjs/common'
import type { ObjectDeletedData } from '@pep/shared'
import { LendingService } from './lending.service'

export function objectDeletedHandler(lending: LendingService) {
	const logger = new Logger('ObjectDeletedHandler')

	return async (data: ObjectDeletedData): Promise<void> => {
		const cancelled = await lending.updateAllForObjectDeleted(data.objectId)
		logger.log(`object.deleted(${data.objectId}) -> cancelled ${cancelled} lending row(s)`)
	}
}
