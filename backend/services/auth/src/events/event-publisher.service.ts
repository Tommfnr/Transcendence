import { Injectable } from '@nestjs/common'
import { optionalEnv, EventEnvelope } from '@pep/shared'

@Injectable()
export class EventPublisherService {
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

		await Promise.allSettled(
			subscriberUrls.map((url) =>
				fetch(`${url}/internal/events`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(envelope),
				}),
			),
		)
	}
}
