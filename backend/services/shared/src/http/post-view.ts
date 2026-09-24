export interface PostView {
	id: number
	ownerId: number
	status: 'open' | 'closed'
	groupIds: number[]
	fromDate: string
	toDate: string
}
