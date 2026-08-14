// DTO : Data Transfer Object : made encapsulate data for transfer between different layers of an application
// See : https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff649585(v=pandp.10)

export class CreateObjectDto {
	brand!: string
	type!: string
	description?: string
	condition?: string
}