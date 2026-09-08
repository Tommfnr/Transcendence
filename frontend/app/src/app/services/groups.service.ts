import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupData, GroupForm, GroupMemberData, GroupMemberForm } from "../models/group-data.model";

@Injectable({ providedIn: 'root'})
export class GroupsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<GroupData[]>('/api/groups/my');
    }

    findOne(groupId: number) {
        return this.http.get<GroupData>(`/api/groups/${groupId}`);
    }

    findMembers(groupId: number) {
        return this.http.get<GroupMemberData[]>(`/api/groups/${groupId}/members`);
    }

    create(body: GroupForm) {
        return this.http.post<GroupData>('/api/groups', body);
    }

    grantObject(groupId: number, objectId: number) {
        return this.http.post(`/api/groups/${groupId}/objects/${objectId}/grant`, {});
    }

    addMember(groupId: number, targetUserId: number) {
        return this.http.post<GroupMemberData>(`/api/groups/${groupId}/members/${targetUserId}`, {});
    }

    update(groupId: number, body: GroupForm) {
        return this.http.patch<GroupData>(`/api/groups/${groupId}`, body);
    }

    updateMemberRole(groupId: number, targetUserId: number, body: GroupMemberForm) {
        return this.http.patch<GroupMemberData>(`/api/groups/${groupId}/members/${targetUserId}/role`, body);
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
