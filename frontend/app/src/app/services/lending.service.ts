import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LendingEntity, LendingInput } from '../models/lending.model';

@Injectable({
    providedIn: 'root',
})
export class LendingService {
    private http = inject(HttpClient);

    listAll() {
        return this.http.get<LendingEntity[]>('/api/lending');
    }

    create(body: LendingInput) {
        return this.http.post<LendingEntity>('/api/lending', body);
    }

    findOne(id: number) {
        return this.http.get<LendingEntity>(`/api/lending/${id}`);
    }

    accept(id: number) {
        return this.http.patch<LendingEntity>(`/api/lending/${id}/accept`, {});
    }

    reject(id: number) {
        return this.http.patch<LendingEntity>(`/api/lending/${id}/reject`, {});
    }
}
