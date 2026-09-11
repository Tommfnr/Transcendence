export type GroupRole = 'admin' | 'member';

export interface GroupEntity {
    id: number;
    name: string;
    description: string | null;
    ownerId: number;
    role: GroupRole;
    createdAt: string;
    updatedAt: string;
}

export type GroupInput = Pick<GroupEntity, 'name'> & { description: string };

export interface GroupMemberEntity {
    id: number;
    groupId: number;
    userId: number;
    role: GroupRole;
    createdAt: string;
    updatedAt: string;
}

export type GroupMemberInput = Pick<GroupMemberEntity, 'role'>;