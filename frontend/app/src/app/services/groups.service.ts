import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupData, GroupFormData } from "../models/group-data.model";

@Injectable({ providedIn: 'root'})
export class GroupsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<GroupData[]>('/api/groups/my');
    }

    grantObject(groupId: number, objectId: number) {
        return this.http.post(`/api/groups/${groupId}/objects/${objectId}/grant`, {});
    }

    findOne(groupId: number) {
        return this.http.get<GroupData>(`/api/groups/${groupId}`);
    }

    create(body: GroupFormData) {
        return this.http.post<GroupData>('/api/groups', body);
    }

    update(groupId: number, body: GroupFormData) {
        return this.http.patch<GroupData>(`/api/groups/${groupId}`, body);
    }

    deleteGroup(groupId: number) {
        return this.http.delete<{ message: string }>(`/api/groups/${groupId}`);
    }
}
