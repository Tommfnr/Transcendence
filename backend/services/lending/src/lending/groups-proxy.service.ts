import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError } from '@pep/shared'
import { GROUPS_INTERNAL_CLIENT } from './lending.tokens'

interface SharedGroupCheckResult {
	sharesGroup: boolean
}

@Injectable()
export class GroupsProxyService {
	private readonly logger = new Logger(GroupsProxyService.name)

	constructor(@Inject(GROUPS_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async sharesGroup(userIds: number[], groupIds?: number[]): Promise<boolean> {
		if (groupIds && groupIds.length === 0)
			return (false)

		const result = await this.call(() => this.client.post<SharedGroupCheckResult>(
			'/internal/groups/shared-group-check',
			{ userIds, groupIds },
		))

		return (result?.sharesGroup === true)
	}

	private async call<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return (await fn())
		} catch (err) {
			if (err instanceof InternalServiceError) {
				this.logger.error(`internal call to groups failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('groups service unavailable', { cause: err })
			}
			throw err
		}
	}
}
