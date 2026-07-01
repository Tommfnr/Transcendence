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

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return (this.authService.register(dto))
	}
}
