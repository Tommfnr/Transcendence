import { Controller, Get, Post, UseGuards, Param, Req, Body } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get('my')
	findMy(@Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findMy(userId)
	}

	@Get(':conversationId')
	findOne(@Param('conversationId') conversationId: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findOne(Number(conversationId), userId)
	}

	@Get(':conversationId/messages')
	findMessages(@Param('conversationId') conversationId: string, @Req() req: AuthenticatedRequest) {
		const userId = req.user.sub
		return this.chatsService.findMessages(Number(conversationId), userId)
	}

	@Post()
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreateConversationDto) {
		const userId = req.user.sub
		return this.chatsService.create(userId, dto)
	}

	@Post(':conversationId/messages')
	createMessage(@Param('conversationId') conversationId: string, @Req() req: AuthenticatedRequest, @Body() dto: CreateMessageDto) {
		const userId = req.user.sub
		return this.chatsService.createMessage(Number(conversationId), userId, dto)
	}
}
