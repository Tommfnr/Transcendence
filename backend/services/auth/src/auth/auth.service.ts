import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokensService } from './refreshtokens.service'
import { RegisterDto } from '../users/dto/register.dto'

@Injectable()
export class AuthService {
	constructor(private readonly usersService: UsersService,
							private readonly refreshTokensServices: RefreshTokensService,
							private jwtService: JwtService) {}

	async signIn(loginIdentifier: string, pass: string): Promise<{ access_token: string; refresh_token: string }> {
		const [user] = await this.usersService.findOne(loginIdentifier)
		if (!user) {
			throw new UnauthorizedException('Invalid credentials')
		}
		const match = await argon2.verify(user.h_password, pass)
		if (!match) {
			throw new UnauthorizedException('Invalid credentials')
		}
		const payload = { sub: user.id, username: user.username }
		const access_token = await this.jwtService.signAsync(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '60s',
		})
		const { jti } = await this.refreshTokensServices.issue(user.id)
		const refresh_token = await this.jwtService.signAsync({ sub: user.id, type: 'refresh', jti }, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d',
		})
		return { access_token, refresh_token }
	}

	async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
		let payload: { sub: number; username: string; type: string; jti: string }
		try {
			payload = await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET })
		} catch {
			throw new UnauthorizedException('Invalid refresh token')
		}
		if (payload.type !== 'refresh' || !payload.jti) {
			throw new UnauthorizedException('Invalid request')
		}
		const row = await this.refreshTokensServices.findByJti(payload.jti)
		if (!row || row.expiresAt.getTime() < Date.now()) {
			throw new UnauthorizedException('Invalid refresh token')
		}
		if (row.revoked) {
			await this.refreshTokensServices.revokeAllForUser(row.userId)
			throw new UnauthorizedException('Invalid refresh token')
		}
		await this.refreshTokensServices.revoke(payload.jti)
		const { jti: newJti } = await this.refreshTokensServices.issue(payload.sub)
		const newPayload = { sub: payload.sub, username: payload.username }
		const access_token = await this.jwtService.signAsync(newPayload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '60s'
		})
		const refresh_token = await this.jwtService.signAsync({ ...newPayload, type: 'refresh', jti: newJti }, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d'
		})
		return { access_token, refresh_token }
	}

	async register(dto: RegisterDto) {
		return (this.usersService.create(dto))
	}

	async logout(refreshToken: string): Promise<void> {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET })
			if (payload?.jti) {
				await this.refreshTokensServices.revoke(payload.jti)
			}
		} catch {
		}
	}
}
