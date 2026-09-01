export type ObjectCondition = 'new' | 'good' | 'worn';

export interface ObjectData {
  id: number;
  name: string;
  ownerId: number;
  type: string;
  description: string | null;
  condition: ObjectCondition;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
