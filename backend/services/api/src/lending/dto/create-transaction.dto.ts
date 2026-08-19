import { IsInt, IsPositive, IsISO8601, IsOptional, IsString, MaxLength, Max } from 'class-validator'

export class CreateTransactionDto {
	@IsInt()
	@IsPositive()
	objectId!: number

	@IsISO8601()
	lendedFrom!: string

	@IsISO8601()
	lendedTo!: string

	@IsOptional()
	@IsString()
	@MaxLength(250)
	message?: string
}