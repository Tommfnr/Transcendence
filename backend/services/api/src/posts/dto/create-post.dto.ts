import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const createPostSchema = z.object({
	title:			z.string().min(1, 'Title required').max(50, 'Max 50 characters'),
	type:			z.string().max(20).optional(),
	description:	z.string().max(500).optional(),
	fromDate:		z.coerce.date(),
	toDate:			z.coerce.date(),
	groupIds:		z.array(z.number().int().positive()).min(1, 'Select at least one group'),
}).refine((data) => data.toDate >= data.fromDate, {
	message: 'toDate must be on or after fromDate',
	path: ['toDate'],
})

export class CreatePostDto extends createZodDto(createPostSchema) {}
