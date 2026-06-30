import { z } from 'zod'

export const usernameSchema = z
	.string()
	.min(3, 'Min 3 characters')
	.max(15, 'Max 15 characters')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, digits, or _, -')

export const passwordSchema = z
	.string()
	.min(8, 'Min 8 characters')
	.max(128, 'Max 128 characters')
	.regex(/[A-Z]/, 'Need at least one uppercase character')
	.regex(/[0-9]/, 'Need at least one digit')
	.regex(/[^a-zA-Z0-9]/, 'Need at least one special character')