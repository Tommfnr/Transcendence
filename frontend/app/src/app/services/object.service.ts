import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObjectEntity, ObjectInput } from '../models/object.model';

@Injectable({
	providedIn: 'root'
})

export class ObjectService {
	private http = inject(HttpClient)

	findMy() {
		return this.http.get<ObjectEntity[]>('/api/objects/my');
	}

	findOne(id: number) {
		return this.http.get<ObjectEntity>(`/api/objects/${id}`);
	}

	create(body: ObjectInput) {
		return this.http.post<ObjectEntity[]>('/api/objects', body);
	}

	update(id: number, body: ObjectInput) {
		return this.http.put<ObjectEntity[]>(`/api/objects/${id}`, body);
	}

	remove(id: number) {
		return this.http.delete<void>(`/api/objects/${id}`);
	}
}
