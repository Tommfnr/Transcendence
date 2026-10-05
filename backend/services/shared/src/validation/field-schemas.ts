import { z } from 'zod'

export const usernameSchema = z
	.string('Please input a string')
	.min(3, 'Min 3 characters')
	.max(15, 'Max 15 characters')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, digits, or _, -')

export const emailSchema = z
	.string('Please input a string')
	.trim()
	.pipe(z.email('Invalid email format'))
	.transform((v) => v.toLowerCase())
	.refine((v) => v.length <= 320, {
		error: 'Email too long',
	})

export const passwordSchema = z
	.string('Please input a string')
	.regex(
		/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,128}$/,
		'Password must be 8-128 chars and include an uppercase letter, a digit, and a special character',
	)

export const loginIdentifierSchema = z
	.string('Please input a string')
	.trim()
	.min(1, 'Username or email required')
	.refine(
		(value) => {
			if (value.includes('@')) {
				return z.email().safeParse(value).success
			}

			return usernameSchema.safeParse(value).success
		},
		{ error: 'Invalid username or email' },
	)

export const nameSchema = (max: number) => z
	.string('Please input a string')
	.min(1, 'Name required')
	.max(max, `Max ${max} characters`)
	.regex(/^[a-zA-Z0-9 ]{1,}$/, 'Only letters, digits, and spaces allowed')

export const descriptionSchema = z
	.string('Please input a string')
	.max(500, 'Max 500 characters')

export const objectTypeSchema = z
	.enum([
		'DIY',
		'Electronics',
		'Leisure',
		'Other',
	])

export const objectConditionSchema = z
	.enum(['new', 'good', 'worn'])

export const messageContentSchema = z
	.string('Please input a string')
	.min(1, 'Message required')
	.max(2000, 'Max 2000 characters')
	.refine((v) => v.trim().length > 0, 'Message required')
