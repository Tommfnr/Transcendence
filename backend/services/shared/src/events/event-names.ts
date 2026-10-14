export const EVENT = {
	UserRegistered: 'user.registered',
	UserDeleted: 'user.deleted',
	ObjectDeleted: 'object.deleted',
	PostDeleted: 'post.deleted',

	// TODO add as services are carved:
	// ObjectAvailabilityChanged: 'object.availability_changed',
	// LendingActivated: 'lending.activated',
	// LendingReturned: 'lending.returned',
	// GroupMemberAdded: 'group.member_added',
	// GroupMemberRemoved: 'group.member_removed',
} as const

export type EventName = (typeof EVENT)[keyof typeof EVENT]
