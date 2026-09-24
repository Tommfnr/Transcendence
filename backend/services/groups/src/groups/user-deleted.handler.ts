import { Logger } from '@nestjs/common'
import type { UserDeletedData } from '@pep/shared'
import { GroupsService } from './groups.service'

export function userDeletedHandler(groups: GroupsService) {
	const logger = new Logger('UserDeletedHandler')

	return async (data: UserDeletedData): Promise<void> => {
		const orphanedGroups = await groups.removeMembershipsForUser(data.userId)
		logger.log(`user.deleted(${data.userId}) -> dropped memberships, deleted ${orphanedGroups} admin-less group(s)`)
	}
}
