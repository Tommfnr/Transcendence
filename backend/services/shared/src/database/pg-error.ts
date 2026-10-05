export function pgErrorCode(err: unknown): string | undefined {
	const wrappedCause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined
	const cause = wrappedCause instanceof Error ? wrappedCause : err

	if (cause instanceof Error && 'code' in cause && typeof cause.code === 'string')
		return (cause.code)
	return (undefined)
}
