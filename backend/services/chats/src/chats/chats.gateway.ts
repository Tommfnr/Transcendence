import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: true, path: '/api/socket.io' })
export class ChatsGateway {
	@WebSocketServer() server!: Server
}
