export interface PostView {
	id: number
	ownerId: number
	title: string
	status: 'open' | 'closed'
	groupIds: number[]
	fromDate: string
	toDate: string
}
