export type LendingStatus =
	| 'created'
	| 'pending'
	| 'accepted'
	| 'active'
	| 'awaiting_confirmation'
	| 'returned'
	| 'disputed'
	| 'rejected'
	| 'cancelled'
	| 'overdue';

export interface LendingEntity {
	id: number;
	objectId: number;
	lenderId: number;
	borrowerId: number;
	status: LendingStatus;
	lendedFrom: string;
	lendedTo: string;
	pickedUpAt: string | null;
	borrowerReturnedAt: string | null;
	lenderConfirmedReturnedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateLendingInput {
	objectId: number;
	lendedFrom: string;
	lendedTo: string;
	// NB: le backend valide ce champ via Zod mais ne le persiste pas encore
	// (colonne absente de la table lending) - a corriger cote backend.
	message?: string;
}