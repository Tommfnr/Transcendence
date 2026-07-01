import { z } from 'zod'

export const usernameSchema = z
	.string()
	.min(3, 'Min 3 characters')
	.max(15, 'Max 15 characters')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, digits, or _, -')

export const passwordSchema = z
	.string()
	.regex(
			/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,128}$/,
			'Password must be 8-128 chars and include an uppercase letter, a digit, and a special character'
		)