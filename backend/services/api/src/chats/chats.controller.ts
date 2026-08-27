import { Controller, Get, Post, Param, Req, Body, UseGuards } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { AuthGuard } from '../auth/guard'

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get('my')
	findMy(@Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findMy(userId)
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findOne(Number(id), userId)
	}

	@Get(':id/messages')
	findMessages(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findMessages(Number(id), userId)
	}

	@Post()
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreateConversationDto) {
		const userId = req.user.sub
		return this.chatsService.create(userId, dto)
	}

	@Post(':id/messages')
	createMessage(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() dto: CreateMessageDto) {
		const userId = req.user.sub
		return this.chatsService.createMessage(Number(id), userId, dto)
	}
}
