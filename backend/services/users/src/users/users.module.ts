import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersProxyService } from './users-proxy.service'

@Module({
	controllers: [UsersController],
	providers: [UsersProxyService],
})
export class UsersModule {}
