import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { LendingService } from './lending.service'

// Marks loans as overdue once their end date has passed, without anyone having to act
@Injectable()
export class OverdueJob implements OnApplicationBootstrap {
	private readonly logger = new Logger(OverdueJob.name)
	
	constructor(private readonly lendingService: LendingService) {}
	
	// Catches up right after a restart instead of waiting for the next hour
	async onApplicationBootstrap() {
		await this.run()
	}
	
	@Cron(CronExpression.EVERY_HOUR)
	async run() {
		try {
			const count = await this.lendingService.markOverdue()
			if (count > 0)
				this.logger.log(`marked ${count} loan(s) overdue`)
		} catch (err: unknown) {
			this.logger.error(`could not mark overdue loans: ${(err as Error).message}`)
		}
	}
}
