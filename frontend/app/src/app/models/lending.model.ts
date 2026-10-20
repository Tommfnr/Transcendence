export type LendingStatus =
    | 'created'
    | 'pending'
    | 'accepted'
    | 'active'
    | 'awaiting_confirmation'
    | 'returned'
    | 'overdue'
    | 'disputed'
    | 'rejected'
    | 'cancelled';

/** A loan that went past the offer stage: the requester picked this helper. */
export const CHOSEN_STATUSES: LendingStatus[] = ['accepted', 'active', 'awaiting_confirmation', 'returned', 'overdue', 'disputed'];

export interface LendingEntity {
    id: number;
    objectId: number;
    lenderId: number;
    borrowerId: number;
    postId: number;
    status: LendingStatus;
    lendedFrom: string;
    lendedTo: string;
    message: string | null;
    pickedUpAt: string | null;
    borrowerReturnedAt: string | null;
    lenderConfirmedReturnedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LendingInput {
    objectId: number;
    postId: number;
    lendedFrom: string;
    lendedTo: string;
    message?: string;
}
