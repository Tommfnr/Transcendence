import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/signin.dto'
import { RegisterDto } from '../users/dto/register.dto'
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS } from './types/cookies-constants'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(ThrottlerGuard)
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
		const { access_token, refresh_token } = await this.authService.signIn(dto.identifier, dto.password)
		res.cookie(REFRESH_COOKIE_NAME, refresh_token, REFRESH_COOKIE_OPTIONS)
		return { access_token }
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
		if (!refreshToken) {
			throw new UnauthorizedException('Missing refresh token')
		}
		const { access_token, refresh_token } = await this.authService.refresh(refreshToken)
		res.cookie(REFRESH_COOKIE_NAME, refresh_token, REFRESH_COOKIE_OPTIONS)
		return { access_token }
	}

	@UseGuards(ThrottlerGuard)
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('register')
	register(@Body() dto: RegisterDto) {
		return (this.authService.register(dto))
	}

	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
		if (refreshToken) {
			await this.authService.logout(refreshToken)
		}
		res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_OPTIONS.path })
		return { message: 'Logged out' }
	}
}
