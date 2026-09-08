export type ObjectCondition = 'new' | 'good' | 'worn';

export const OBJECT_TYPES = [
	'Tools',
	'Electronics',
	'Vehicles',
	'Outdoor & Recreation',
	'Media',
	'Events',
	'Clothing & Gear',
] as const;

export type ObjectType = typeof OBJECT_TYPES[number];

export interface ObjectData {
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

export interface CreateObjectData {
  name: string;
  type: ObjectType;
  description: string;
  condition: ObjectCondition;
  isAvailable: boolean;
}