export class InternalServiceError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message)
	}
}

export interface InternalClientConfig {
	baseUrl: string
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 3000

export class InternalServiceClient {
	private readonly baseUrl: string
	private readonly timeoutMs: number

	constructor(config: InternalClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, '')
		this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	get<T>(path: string): Promise<T | null> {
		return this.request<T>('GET', path)
	}

	async delete(path: string): Promise<void> {
		await this.request('DELETE', path)
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), this.timeoutMs)

		let res: Response
		try {
			res = await fetch(`${this.baseUrl}${path}`, {
				method,
				headers: body ? { 'Content-Type': 'application/json' } : undefined,
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			})
		} catch (err) {
			throw new InternalServiceError(0, `${method} ${path} failed: ${(err as Error).message}`)
		} finally {
			clearTimeout(timer)
		}

		if (res.status === 404) {
			return null
		}

		if (!res.ok) {
			throw new InternalServiceError(res.status, `${method} ${path} failed with status ${res.status}`)
		}

		if (res.status === 204) {
			return null
		}

		return (await res.json()) as T
	}
}
