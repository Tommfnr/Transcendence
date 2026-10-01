import { Module } from '@nestjs/common'
import { InternalUsersController } from './internal-users.controller'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [UsersModule],
	controllers: [InternalUsersController],
})
export class InternalUsersModule {}
