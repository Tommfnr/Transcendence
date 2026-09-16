import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LendingEntity, CreateLendingInput } from '../models/lending.model';

@Injectable({
    providedIn: 'root'
})
export class LendingService {
    private http = inject(HttpClient);

    listAll() {
        return this.http.get<LendingEntity[]>('/api/lending');
    }

    findOne(id: number) {
        return this.http.get<LendingEntity>(`/api/lending/${id}`);
    }

    findByPostId(postId: number) {
        return this.http.get<LendingEntity[]>(`/api/lending/post/${postId}`);
    }

    create(body: CreateLendingInput) {
        return this.http.post<LendingEntity[]>('/api/lending', body);
    }

    accept(id: number) {
        return this.http.patch<LendingEntity>(`/api/lending/${id}/accept`, {});
    }
}