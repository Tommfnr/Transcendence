import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { JwtModule } from '@nestjs/jwt'
import * as dotenv from 'dotenv'
import { AuthGuard } from './guard'
import { RefreshTokensService } from './refreshtokens.service'
import { ThrottlerModule } from '@nestjs/throttler'

dotenv.config()

@Module({
	imports: [UsersModule,
						JwtModule.register({ global: true }),
						ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
	providers: [AuthService, AuthGuard, RefreshTokensService],
	controllers: [AuthController],
	exports: [AuthGuard],
})
export class AuthModule {}