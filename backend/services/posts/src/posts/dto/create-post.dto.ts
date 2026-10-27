import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema, idSchema, dateSchema } from '@pep/shared'

export const createPostSchema = z.object({
	title:			nameSchema(60),
	objectType:		objectTypeSchema,
	description:	descriptionSchema.optional(),
	fromDate:		dateSchema,
	toDate:			dateSchema,
	groupIds:		z.array(idSchema).min(1, 'Select at least one group'),
}).refine((data) => data.toDate > data.fromDate, {
	message: 'End date must be after the start date',
	path: ['toDate'],
}).refine((data) => {
	const startOfToday = new Date()
	startOfToday.setUTCHours(0, 0, 0, 0)
	return (data.fromDate >= startOfToday)
}, {
	message: 'Start date cannot be in the past',
	path: ['fromDate'],
})

export class CreatePostDto extends createZodDto(createPostSchema) {}
