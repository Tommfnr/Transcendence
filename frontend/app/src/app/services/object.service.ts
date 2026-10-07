import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ObjectEntity, ObjectInput } from '../models/object.model';

@Injectable({
	providedIn: 'root'
})

export class ObjectService {
	private http = inject(HttpClient)

	// bumped after each create/update so pages listing objects can reload
	readonly changes = signal(0);

	findMy() {
		return this.http.get<ObjectEntity[]>('/api/objects/my');
	}

	findOne(id: number) {
		return this.http.get<ObjectEntity>(`/api/objects/${id}`);
	}

	create(body: ObjectInput) {
		return this.http.post<ObjectEntity[]>('/api/objects', body).pipe(
			tap(() => this.changes.update((n) => n + 1))
		);
	}

	update(id: number, body: ObjectInput) {
		return this.http.put<ObjectEntity[]>(`/api/objects/${id}`, body).pipe(
			tap(() => this.changes.update((n) => n + 1))
		);
	}

	remove(id: number) {
		return this.http.delete<void>(`/api/objects/${id}`);
	}
}
