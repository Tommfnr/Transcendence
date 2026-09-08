import { ObjectType } from './object-data.model';

export type PostStatus = 'open' | 'closed';

export interface PostData {
    id: number;
    ownerId: number;
    title: string;
    objectType: ObjectType;
    description: string | null;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
    fromDate: string;
    toDate: string;
}

export interface PostForm {
    title: string;
    objectType: ObjectType;
    description: string | null;
    status?: PostStatus;
    fromDate: string;
    toDate: string;
    groupIds?: number[];
}

export interface PostGroupData {
    id: number;
    postId: number;
    groupId: number;
}