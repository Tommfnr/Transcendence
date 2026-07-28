import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from '../users/dto/register.dto'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService,
	 						private jwtService: JwtService) {}

	async signIn(loginIdentifier: string, pass: string): Promise<{ 
		access_token: string 
		refresh_token: string }> {
		
		const [user] = await this.usersService.findOne(loginIdentifier)

		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		// console.log('h_password: ', user.h_password)
		const match = await argon2.verify(user.h_password, pass)

		if (!match) {
			throw new UnauthorizedException('Invalid credentials')
		}
	
		const payload	= { sub: user.id, username: user.username }
		
		const access_token = await this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '60s',
		})

		const refresh_token = await this.jwtService.signAsync({ sub: user.id, type: 'refresh'}, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d',
		})
		
		return { access_token, refresh_token }
	}

	async refresh(refreshToken: string) : Promise<{ access_token: string }> {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET,
			})

			const newPayload = { sub: payload.sub, username: payload.username }

			return {
				access_token: await this.jwtService.signAsync(newPayload, {
					secret: process.env.JWT_SECRET,
					expiresIn: '60s',
				}),
			}
		} catch {
			throw new UnauthorizedException('Invalid refresh token')
		}
	}

	async register(dto: RegisterDto) {
			return (this.usersService.create(dto))
	}
}