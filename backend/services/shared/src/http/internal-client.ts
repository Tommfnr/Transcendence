export class InternalServiceError extends Error {
	readonly cause?: unknown

	constructor(
		public readonly status: number,
		message: string,
		options?: { cause?: unknown },
	) {
		super(message)
		this.name = 'InternalServiceError'
		this.cause = options?.cause
	}
}

export interface InternalClientConfig {
	baseUrl: string
	apiKey: string
	timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 3000

export class InternalServiceClient {
	private readonly baseUrl: string
	private readonly apiKey: string
	private readonly timeoutMs: number

	constructor(config: InternalClientConfig) {
		if (!config.baseUrl) {
			throw new Error('InternalServiceClient requires a non-empty baseUrl')
		}
		if (!config.apiKey) {
			throw new Error('InternalServiceClient requires a non-empty apiKey')
		}
		if (config.timeoutMs !== undefined && config.timeoutMs <= 0) {
			throw new Error('InternalServiceClient timeoutMs must be positive')
		}
		this.baseUrl = config.baseUrl.replace(/\/$/, '')
		this.apiKey = config.apiKey
		this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
	}

	get<T>(path: string): Promise<T | null> {
		return this.request<T>('GET', path)
	}

	post<T>(path: string, body: unknown): Promise<T | null> {
		return this.request<T>('POST', path, body)
	}

	put<T>(path: string, body: unknown): Promise<T | null> {
		return this.request<T>('PUT', path, body)
	}

	async delete(path: string): Promise<void> {
		await this.request('DELETE', path)
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), this.timeoutMs)

		const headers: Record<string, string> = { Authorization: `Bearer ${this.apiKey}` }
		if (body !== undefined) {
			headers['Content-Type'] = 'application/json'
		}

		try {
			let res: Response
			try {
				res = await fetch(`${this.baseUrl}${path}`, {
					method,
					headers,
					body: body !== undefined ? JSON.stringify(body) : undefined,
					redirect: 'error',
					signal: controller.signal,
				})
			} catch (err) {
				throw new InternalServiceError(0, `${method} ${path} failed: ${(err as Error).message}`, { cause: err })
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

			try {
				const text = await res.text()
				return (text === '' ? null : JSON.parse(text)) as T
			} catch (err) {
				if (controller.signal.aborted) {
					throw new InternalServiceError(0, `${method} ${path} failed: ${(err as Error).message}`, { cause: err })
				}
				throw new InternalServiceError(res.status, `${method} ${path} returned an unparseable body`, { cause: err })
			}
		} finally {
			clearTimeout(timer)
		}
	}
}
