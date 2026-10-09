import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser, ParseIdPipe, SharedAuthGuard } from '@pep/shared'
import { ApiKeysService } from './api-keys.service'
import { CreateApiKeyDto } from './dto/create-api-key.dto'

@UseGuards(SharedAuthGuard)
@Controller('auth/api-keys')
export class ApiKeysController {
	constructor(private readonly apiKeysService: ApiKeysService) {}

	@Post()
	create(@CurrentUser('sub') userId: number, @Body() dto: CreateApiKeyDto) {
		return (this.apiKeysService.create(userId, dto.name))
	}

	@Get()
	findAll(@CurrentUser('sub') userId: number) {
		return (this.apiKeysService.findAllForUser(userId))
	}

	@Delete(':id')
	@HttpCode(204)
	remove(@CurrentUser('sub') userId: number, @Param('id', ParseIdPipe) id: number) {
		return (this.apiKeysService.revoke(userId, id))
	}
}
