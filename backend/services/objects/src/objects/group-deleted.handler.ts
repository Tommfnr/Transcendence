import { Logger } from '@nestjs/common'
import type { GroupDeletedData } from '@pep/shared'
import { ObjectsService } from './objects.service'

export function groupDeletedHandler(objects: ObjectsService) {
	const logger = new Logger('GroupDeletedHandler')

	return async (data: GroupDeletedData): Promise<void> => {
		await objects.removeAllGrantsByGroup(data.groupId)
		logger.log(`group.deleted(${data.groupId}) -> cleaned up object group grants`)
	}
}
