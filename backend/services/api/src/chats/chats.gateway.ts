import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../auth/types/authenticated-request'

export interface AuthenticatedSocket extends Socket {
	data: {
		user: JwtPayload
	}
}

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
		}
	}
}
