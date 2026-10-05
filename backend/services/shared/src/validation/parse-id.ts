import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

const ID_PATTERN = /^[1-9]\d{0,9}$/
const MAX_ID = 2147483647

export function parseId(raw: unknown): number {
	if (typeof raw !== 'string' || !ID_PATTERN.test(raw))
		throw new BadRequestException('Invalid id')

	const id = Number(raw)

	if (id > MAX_ID)
		throw new BadRequestException('Invalid id')
	return (id)
}

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
	transform(value: string): number {
		return (parseId(value))
	}
}
