import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/signin.dto'
import { RegisterDto } from '../users/dto/register.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	signIn(@Body() dto: SignInDto) {
		return (this.authService.signIn(dto.username, dto.password))
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	refresh(@Body('refresh_token') refreshToken: string) {
		return (this.authService.refresh(refreshToken))
	}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return (this.authService.register(dto))
	}
}
