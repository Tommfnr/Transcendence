export type GroupRole = 'admin' | 'member';

export interface GroupData {
    id: number;
    name: string;
    description: string | null;
    ownerId: number;
    role: GroupRole;
    createdAt: string;
    updatedAt: string;
}

export type GroupForm = Pick<GroupData, 'name'> & { description: string };

export interface GroupMemberData {
    id: number;
    groupId: number;
    userId: number;
    role: GroupRole;
    createdAt: string;
    updatedAt: string;
}

export type GroupMemberForm = Pick<GroupMemberData, 'role'>;

export interface GroupObjectGrantData {
    id: number;
    groupId: number;
    objectId: number;
    grantedBy: number;
    createdAt: string;
    updatedAt: string;
}