export function requireEnv(name: string): string {
	const value = process.env[name]

	if (value === undefined || value === '') {
		throw new Error(`Missing required environment variable: ${name}`)
	}

	return value
}

export function optionalEnv(name: string, fallback: string): string {
	const value = process.env[name]

	return value === undefined || value === '' ? fallback : value
}

export function requireEnvInt(name: string): number {
	const parsed = Number(requireEnv(name))

	if (!Number.isInteger(parsed)) {
		throw new Error(`Environment variable ${name} must be an integer`)
	}

	return parsed
}
