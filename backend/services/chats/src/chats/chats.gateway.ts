import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../auth/types/authenticated-request'

export interface AuthenticatedSocket extends Socket {
	data: {
		user: JwtPayload
	}
}

// Events pushed to clients, the frontend listens to these exact names
export const CHAT_EVENTS = {
	conversationNew:	'conversation:new',
	messageNew:			'message:new',
} as const

export type ChatEvent = typeof CHAT_EVENTS[keyof typeof CHAT_EVENTS]

// Every socket joins the personal room of its user, so all of a user's tabs/devices can be reached at once
const userRoom = (userId: number) => `user:${userId}`

@WebSocketGateway({ cors: true, path: '/api/socket.io' })
export class ChatsGateway implements OnGatewayConnection {
	@WebSocketServer() server!: Server

	constructor(private jwtService: JwtService) {}

	async handleConnection(client: AuthenticatedSocket) {
		const token = client.handshake.auth?.token as string | undefined

		if (!token) {
			client.disconnect()
			return
		}

		try {
			client.data.user = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret: process.env.JWT_SECRET,
			})
		} catch {
			client.disconnect()
			return
		}

		client.join(userRoom(client.data.user.sub))
	}

	emitToUsers(userIds: number[], event: ChatEvent, payload: unknown) {
		this.server.to(userIds.map(userRoom)).emit(event, payload)
	}
}
