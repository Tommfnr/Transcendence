import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection } from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { ChatsService } from './chats.service'

@WebSocketGateway({ cors: true, path: '/api/socket.io' })
export class ChatsGateway implements OnGatewayConnection {
	@WebSocketServer() server!: Server

	constructor(
		private readonly chatsService: ChatsService,
		private readonly jwtService: JwtService,
	) {}

	async handleConnection(client: Socket) {
		try {
			let token = client.handshake.auth.token

			// TEST ONLY: query fallback for clients that can't set the `auth` handshake option (e.g. Postman) — delete these two lines to remove
			if (!token)
				token = client.handshake.query.token

			const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET })
			client.data.userId = payload.sub
		} catch {
			client.disconnect()
		}
	}

	@SubscribeMessage('join')
	async join(@MessageBody() conversationId: number, @ConnectedSocket() client: Socket) {
		await this.chatsService.findOne(conversationId, client.data.userId)
		client.join(`conversation:${conversationId}`)
	}

	@SubscribeMessage('message')
	async message(@MessageBody() body: { conversationId: number; content: string }, @ConnectedSocket() client: Socket) {
		const message = await this.chatsService.createMessage(body.conversationId, client.data.userId, { content: body.content })
		this.server.to(`conversation:${body.conversationId}`).emit('message', message)
	}
}
