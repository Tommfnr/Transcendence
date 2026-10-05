import { Controller, Get, Post, UseGuards, Param, Body, ParseIntPipe } from '@nestjs/common'
import { CurrentUser, SharedAuthGuard } from '@pep/shared'
import { ChatsService } from './chats.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { ConversationMemberGuard } from './guards/conversation-member.guard'

@Controller('chats')
@UseGuards(SharedAuthGuard)
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get('my')
	findMy(@CurrentUser('sub') userId: number) {
		return (this.chatsService.findMy(userId))
	}

	@Get(':conversationId')
	@UseGuards(ConversationMemberGuard)
	findOne(@Param('conversationId', ParseIntPipe) conversationId: number) {
		return (this.chatsService.findByIdOrThrow(conversationId))
	}

	@Get(':conversationId/messages')
	@UseGuards(ConversationMemberGuard)
	findMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
		return (this.chatsService.findMessages(conversationId))
	}

	@Post()
	create(@CurrentUser('sub') userId: number, @Body() dto: CreateConversationDto) {
		return (this.chatsService.createConversation(userId, dto))
	}

	@Post(':conversationId/messages')
	@UseGuards(ConversationMemberGuard)
	createMessage(
		@Param('conversationId', ParseIntPipe) conversationId: number,
		@CurrentUser('sub') userId: number,
		@Body() dto: CreateMessageDto
	) {
		return (this.chatsService.createMessage(conversationId, userId, dto))
	}
}
