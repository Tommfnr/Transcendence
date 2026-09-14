import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema } from '../../zod/zod.schemas'

const updatePostSchema = z.object({
	title:			nameSchema(60).optional(),
	status:			z.enum(['open', 'closed']).optional(),
	objectType:		objectTypeSchema.optional(),
	description:	descriptionSchema.optional(),
	fromDate:		z.coerce.date().optional(),
	toDate:			z.coerce.date().optional(),
	groupIds:		z.array(z.number().int().positive()).min(1, 'Select at least one group').optional(),
}).refine((data) => !(data.fromDate && data.toDate) || data.toDate >= data.fromDate, {
	message: 'toDate must be on or after fromDate',
	path: ['toDate'],
})

export class UpdatePostDto extends createZodDto(updatePostSchema) {}
