import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GroupData } from "../models/group-data.model";

@Injectable({ providedIn: 'root'})
export class GroupsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<GroupData[]>('/api/groups/my');
    }

    grantObject(groupId: number, objectId: number) {
        return this.http.post(`/api/groups/${groupId}/objects/${objectId}/grant`, {});
    }
}