import { Controller, Get, Post, UseGuards, Param, Req, Body } from '@nestjs/common'
import { ChatsService } from './chats.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { AuthGuard } from '../auth/guard'
import { AuthenticatedRequest } from '../auth/types/authenticated-request'
import { ConversationMemberGuard } from './guards/conversation-member.guard'

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
	@UseGuards(ConversationMemberGuard)
	findOne(@Param('conversationId') conversationId: string) {
		return this.chatsService.findByIdOrThrow(Number(conversationId))
	}

	@Get(':conversationId/messages')
	@UseGuards(ConversationMemberGuard)
	findMessages(@Param('conversationId') conversationId: string) {
		return this.chatsService.findMessages(Number(conversationId))
	}

	@Post()
	create(@Req() req: AuthenticatedRequest, @Body() dto: CreateConversationDto) {
		const userId = req.user.sub
		return this.chatsService.createConversation(userId, dto)
	}

	@Post(':conversationId/messages')
	@UseGuards(ConversationMemberGuard)
	createMessage(@Param('conversationId') conversationId: string, @Req() req: AuthenticatedRequest, @Body() dto: CreateMessageDto) {
		const userId = req.user.sub
		return this.chatsService.createMessage(Number(conversationId), userId, dto)
	}
}
