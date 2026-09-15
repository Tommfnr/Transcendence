import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import { GroupView, InternalAuthGuard } from '@pep/shared'
import { GroupsService } from '../groups/groups.service'
import { MembershipCheckDto } from './dto/membership-check.dto'

function parseIds(raw: string | undefined): number[] {
	if (!raw) {
		return ([])
	}

	return (raw
		.split(',')
		.map((value) => Number(value.trim()))
		.filter((value) => Number.isInteger(value) && value > 0))
}

@UseGuards(InternalAuthGuard)
@Controller('internal/groups')
export class InternalGroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Get()
	async findByIds(@Query('ids') ids?: string): Promise<GroupView[]> {
		const groupIds = parseIds(ids)

		if (groupIds.length === 0) {
			return ([])
		}

		return (this.groupsService.findByIds(groupIds))
	}

	@Post('membership-check')
	@HttpCode(200)
	async membershipCheck(@Body() dto: MembershipCheckDto): Promise<{ isMemberOfAll: boolean }> {
		return ({ isMemberOfAll: await this.groupsService.isMemberOfAll(dto.userId, dto.groupIds) })
	}
}
