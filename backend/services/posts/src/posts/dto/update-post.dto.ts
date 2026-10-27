import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema, idSchema, dateSchema } from '@pep/shared'

export const updatePostSchema = z.object({
	title:			nameSchema(60).optional(),
	status:			z.enum(['open', 'closed']).optional(),
	objectType:		objectTypeSchema.optional(),
	description:	descriptionSchema.optional(),
	fromDate:		dateSchema.optional(),
	toDate:			dateSchema.optional(),
	groupIds:		z.array(idSchema).min(1, 'Select at least one group').optional(),
}).refine((data) => !(data.fromDate && data.toDate) || data.toDate > data.fromDate, {
	message: 'End date must be after the start date',
	path: ['toDate'],
})

export class UpdatePostDto extends createZodDto(updatePostSchema) {}
