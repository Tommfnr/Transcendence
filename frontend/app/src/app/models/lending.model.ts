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

export interface LendingEntity {
    id: number;
    objectId: number;
    lenderId: number;
    borrowerId: number;
    postId: number | null;
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
    postId?: number;
    lendedFrom: string;
    lendedTo: string;
    message?: string;
}
