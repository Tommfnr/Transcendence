import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { JwtModule } from '@nestjs/jwt'
import * as dotenv from 'dotenv'
import { AuthGuard } from './guard'
import { RefreshTokensService } from './refreshtokens.service'

dotenv.config()

@Module({
	imports: [UsersModule,
						JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '60s' }}),
						JwtModule.register({ global: true, secret: process.env.JWT_REFRESH_SECRET, signOptions: { expiresIn: '7d' }})],
	providers: [AuthService, AuthGuard, RefreshTokensService],
	controllers: [AuthController],
	exports: [AuthGuard],
})
export class AuthModule {}