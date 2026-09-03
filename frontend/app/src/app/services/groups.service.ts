import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Group } from "../models/groups.model";

@Injectable({ providedIn: 'root'})
export class GroupsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<Group[]>('/api/groups/my');
    }

    grantObject(groupId: number, objectId: number) {
        return this.http.post(`/api/groups/${groupId}/objects/${objectId}/grant`, {});
    }
}