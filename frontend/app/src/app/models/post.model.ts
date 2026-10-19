import { ObjectType } from './object.model';

export type PostStatus = 'open' | 'closed';

export interface PostEntity {
    id: number;
    ownerId: number;
    title: string;
    objectType: ObjectType;
    description: string | null;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    fromDate: string;
    toDate: string;
}

export interface PostInput {
    title: string;
    objectType: ObjectType;
    description: string;
    status: PostStatus;
    fromDate: string;
    toDate: string;
    groupIds?: number[];
}

export interface PostGroupData {
    id: number;
    name: string;
}