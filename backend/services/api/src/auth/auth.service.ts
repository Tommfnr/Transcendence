import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService,
	 						private jwtService: JwtService) {}

	async signIn(username: string, pass: string): Promise<{ access_token: string}> {
		const [user] = await this.usersService.findOne(username)

		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		// console.log('h_password: ', user.h_password)
		const match = await argon2.verify(user.h_password, pass)

		if (!match) {
			throw new UnauthorizedException('Invalid credentials')
		}
	
		const payload	= { sub: user.id, username: user.username }
		return {access_token: await this.jwtService.signAsync(payload)}
	}
}