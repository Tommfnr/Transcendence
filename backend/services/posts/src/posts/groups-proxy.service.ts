import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { GroupView, InternalServiceClient, InternalServiceError } from '@pep/shared'
import { GROUPS_INTERNAL_CLIENT } from './posts.tokens'

interface MembershipCheckResult {
	isMemberOfAll: boolean
}

@Injectable()
export class GroupsProxyService {
	private readonly logger = new Logger(GroupsProxyService.name)

	constructor(@Inject(GROUPS_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async isMemberOfAll(userId: number, groupIds: number[]): Promise<boolean> {
		const result = await this.call(() => this.client.post<MembershipCheckResult>(
			'/internal/groups/membership-check',
			{ userId, groupIds },
		))

		return (result?.isMemberOfAll === true)
	}

	async findByIds(groupIds: number[]): Promise<GroupView[]> {
		const groups = await this.call(() => this.client.get<GroupView[]>(
			`/internal/groups?ids=${groupIds.join(',')}`,
		))

		return (groups ?? [])
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
