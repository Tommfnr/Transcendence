import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtPayload, verifyAccessToken } from '@pep/shared'

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

// The gateway service forwards /api/socket.io upgrades to this service
@WebSocketGateway({ cors: true, path: '/api/socket.io' })
export class ChatsGateway implements OnGatewayConnection {
	@WebSocketServer() server!: Server

	handleConnection(client: AuthenticatedSocket) {
		const token = client.handshake.auth?.token as string | undefined

		if (!token) {
			client.disconnect()
			return
		}

		try {
			client.data.user = verifyAccessToken(token)
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
