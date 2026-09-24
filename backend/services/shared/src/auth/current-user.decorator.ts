import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { JwtPayload } from './jwt-payload'

export const CurrentUser = createParamDecorator(
	(field: keyof JwtPayload | undefined, context: ExecutionContext) => {
		const req = context.switchToHttp().getRequest()
		const user: JwtPayload | undefined = req.user

		return field ? user?.[field] : user
	},
)
