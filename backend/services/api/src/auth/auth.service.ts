import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import * as argon2 from 'argon2'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService) {}

	async signIn(username: string, pass: string) {
		const [user] = await this.usersService.findOne(username)

		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const match = await argon2.verify(user.h_password, pass)

		if (!match) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return ("haha tu est log") // TODO : make & return JWT 
	}
}