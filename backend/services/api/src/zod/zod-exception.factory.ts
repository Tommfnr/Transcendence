import { BadRequestException } from '@nestjs/common'
import { z } from 'zod'

export function zodExceptionFactory(error: unknown) {
	if (!(error instanceof z.ZodError)) {
		return new BadRequestException('Validation failed')
	}

	const { fieldErrors, formErrors } = z.flattenError(error)

	return new BadRequestException({
		statusCode: 400,
		message: 'Validation failed',
		errors: fieldErrors,
		formErrors,
	})
}
