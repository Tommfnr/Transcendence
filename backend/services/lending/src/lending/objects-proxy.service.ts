import { Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { InternalServiceClient, InternalServiceError, ObjectView } from '@pep/shared'
import { OBJECTS_INTERNAL_CLIENT } from './lending.tokens'

@Injectable()
export class ObjectsProxyService {
	private readonly logger = new Logger(ObjectsProxyService.name)

	constructor(@Inject(OBJECTS_INTERNAL_CLIENT) private readonly client: InternalServiceClient) {}

	async findById(id: number): Promise<ObjectView> {
		const object = await this.call(() => this.client.get<ObjectView>(`/internal/objects/${id}`))
		if (!object) {
			throw new NotFoundException('Object not found')
		}
		return (object)
	}

	private async call<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return (await fn())
		} catch (err) {
			if (err instanceof InternalServiceError) {
				this.logger.error(`internal call to objects failed (status ${err.status}): ${err.message}`)
				throw new ServiceUnavailableException('objects service unavailable', { cause: err })
			}
			throw err
		}
	}
}
