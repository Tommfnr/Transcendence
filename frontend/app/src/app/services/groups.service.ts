import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupEntity, GroupInput, GroupMemberEntity, GroupMemberInput } from "../models/group.model";

@Injectable({ providedIn: 'root'})
export class GroupsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<GroupEntity[]>('/api/groups/my');
    }

    findOne(groupId: number) {
        return this.http.get<GroupEntity>(`/api/groups/${groupId}`);
    }

    findMembers(groupId: number) {
        return this.http.get<GroupMemberEntity[]>(`/api/groups/${groupId}/members`);
    }

    create(body: GroupInput) {
        return this.http.post<GroupEntity>('/api/groups', body);
    }

    grantObject(groupId: number, objectId: number) {
        return this.http.post(`/api/groups/${groupId}/objects/${objectId}/grant`, {});
    }

    addMember(groupId: number, targetUserId: number) {
        return this.http.post<GroupMemberEntity>(`/api/groups/${groupId}/members/${targetUserId}`, {});
    }

    update(groupId: number, body: GroupInput) {
        return this.http.patch<GroupEntity>(`/api/groups/${groupId}`, body);
    }

    updateMemberRole(groupId: number, targetUserId: number, body: GroupMemberInput) {
        return this.http.patch<GroupMemberEntity>(`/api/groups/${groupId}/members/${targetUserId}/role`, body);
    }

    revokeObject(groupId: number, objectId: number) {
        return this.http.delete<{ message: string }>(`/api/groups/${groupId}/objects/${objectId}/grant`);
    }

    removeMember(groupId: number, targetUserId: number) {
        return this.http.delete<{ message: string }>(`/api/groups/${groupId}/members/${targetUserId}`);
    }

    leaveGroup(groupId: number) {
        return this.http.delete<{ message: string }>(`/api/groups/${groupId}/leave`);
    }

    deleteGroup(groupId: number) {
        return this.http.delete<{ message: string }>(`/api/groups/${groupId}`);
    }
}
