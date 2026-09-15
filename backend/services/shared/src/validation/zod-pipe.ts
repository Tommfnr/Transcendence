import { createZodValidationPipe } from 'nestjs-zod'
import { zodExceptionFactory } from './zod-exception.factory'

export const SharedZodValidationPipe = createZodValidationPipe({
	createValidationException: zodExceptionFactory,
})
