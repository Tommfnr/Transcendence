import { Body, Controller, HttpCode, NotFoundException, Post, UseGuards } from '@nestjs/common'
import { InternalAuthGuard } from '@pep/shared'
import { ApiKeyOwner, ApiKeysService } from '../api-keys/api-keys.service'
import { VerifyApiKeyDto } from '../api-keys/dto/verify-api-key.dto'

@UseGuards(InternalAuthGuard)
@Controller('internal/api-keys')
export class InternalApiKeysController {
	constructor(private readonly apiKeysService: ApiKeysService) {}

	@Post('verify')
	@HttpCode(200)
	async verify(@Body() dto: VerifyApiKeyDto): Promise<ApiKeyOwner> {
		const owner = await this.apiKeysService.verify(dto.key)
		if (!owner) {
			throw new NotFoundException()
		}
		return (owner)
	}
}
