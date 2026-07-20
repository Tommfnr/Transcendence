import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const token = req.headers.authorization?.split(' ')[1]

		if (!token)
			throw new UnauthorizedException()

		try {
			req.user = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_SECRET,
			})
		} catch {
			throw new UnauthorizedException()
		}
	
		return (true)
	}
}