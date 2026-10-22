export type LendingStatus =
    | 'pending'
    | 'accepted'
    | 'active'
    | 'awaiting_confirmation'
    | 'returned'
    | 'rejected'
    | 'cancelled'
    | 'overdue';

/** A loan that went past the offer stage: the requester picked this helper. */
export const CHOSEN_STATUSES: LendingStatus[] = ['accepted', 'active', 'awaiting_confirmation', 'returned', 'overdue'];

export interface LendingEntity {
    id: number;
    objectId: number;
    postId: number;
    objectName: string;
    postTitle: string;
    lenderId: number;
    borrowerId: number;
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
