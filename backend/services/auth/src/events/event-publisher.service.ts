import { Injectable, Logger } from '@nestjs/common'
import { optionalEnv, requireEnv, EventEnvelope } from '@pep/shared'

@Injectable()
export class EventPublisherService {
	private readonly logger = new Logger(EventPublisherService.name)
	private readonly apiKey = requireEnv('INTERNAL_API_KEY')

	private getSubscriberUrls(): string[] {
		return optionalEnv('EVENT_SUBSCRIBER_URLS', '')
			.split(',')
			.map((url) => url.trim())
			.filter((url) => url.length > 0)
	}

	async publish(envelope: EventEnvelope): Promise<void> {
		const subscriberUrls = this.getSubscriberUrls()

		if (subscriberUrls.length === 0) {
			return
		}

		const results = await Promise.allSettled(
			subscriberUrls.map((url) => this.deliver(url, envelope)),
		)

		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.warn(
					`Event ${envelope.event} to ${subscriberUrls[index]} not delivered: ${result.reason}`,
				)
			}
		})
	}

	private async deliver(url: string, envelope: EventEnvelope): Promise<void> {
		const res = await fetch(`${url}/internal/events`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(envelope),
		})

		if (!res.ok) {
			throw new Error(`responded ${res.status}`)
		}
	}
}
