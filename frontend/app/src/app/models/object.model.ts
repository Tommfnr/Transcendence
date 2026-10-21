export type ObjectCondition = 'new' | 'good' | 'worn';

// Canonical category vocabulary — mirrors the Figma mocks (chips in
// editAddObject / catalog). The backend zod enum and the object_type
// pgEnum MUST be migrated to the same list before this ships.
export const OBJECT_TYPES = [
	'DIY',
	'Electronics',
	'Leisure',
	'Other',
] as const;

export const OBJECT_TYPES_EMOJI: Record<ObjectType, string> = {
	DIY: '🛠️',
	Electronics: '💻',
	Leisure: '🎾',
	Other: '📦',
};

export type ObjectType = typeof OBJECT_TYPES[number];

export interface ObjectEntity {
  id: number;
  name: string;
  ownerId: number;
  type: ObjectType;
  description: string | null;
  condition: ObjectCondition;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectInput {
  name: string;
  type: ObjectType;
  description: string;
  condition: ObjectCondition;
  isAvailable: boolean;
}