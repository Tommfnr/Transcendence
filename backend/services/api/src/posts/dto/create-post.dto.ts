import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { nameSchema, descriptionSchema, objectTypeSchema } from '../../zod/zod.schemas'

const createPostSchema = z.object({
	title:			nameSchema(60),
	objectType:		objectTypeSchema,
	description:	descriptionSchema,
	fromDate:		z.coerce.date(),
	toDate:			z.coerce.date(),
	groupIds:		z.array(z.number().int().positive()).min(1, 'Select at least one group'),
}).refine((data) => data.toDate >= data.fromDate, {
	message: 'toDate must be on or after fromDate',
	path: ['toDate'],
})

export class CreatePostDto extends createZodDto(createPostSchema) {}
