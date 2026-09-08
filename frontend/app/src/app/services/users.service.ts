import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "../models/user.model";

@Injectable({ providedIn: 'root'})
export class UsersService {
    private http = inject(HttpClient);

    findAll() {
        return this.http.get<User[]>('/api/users');
    }

    findOne(id: number) {
        return this.http.get<User>(`/api/users/${id}`);
    }

    findByUsername(username: string) {
        return this.http.get<User>(`/api/users/username/${username}`);
    }

    remove(id: number) {
        return this.http.delete<unknown[]>(`/api/users/${id}`);
    }
}