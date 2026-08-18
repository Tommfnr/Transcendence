import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const updatePostSchema = z.object({
	title:			z.string().min(1, 'Title required').max(50, 'Max 50 characters').optional(),
	type:			z.string().max(20).optional(),
	description:	z.string().max(500).optional(),
	fromDate:		z.coerce.date().optional(),
	toDate:			z.coerce.date().optional(),
	groupIds:		z.array(z.number().int().positive()).min(1, 'Select at least one group').optional(),
})

export class UpdatePostDto extends createZodDto(updatePostSchema) {}
