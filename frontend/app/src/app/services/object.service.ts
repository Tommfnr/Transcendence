import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObjectData, CreateObjectData } from '../models/object-data.model';

@Injectable({
	providedIn: 'root'
})

export class ObjectService {
	private http = inject(HttpClient)

	findMy() {
		return this.http.get<ObjectData[]>('/api/objects/my');
	}

	findOne(id: number) {
		return this.http.get<ObjectData>(`/api/objects/${id}`);
	}

	create(body: CreateObjectData) {
		return this.http.post<ObjectData[]>('/api/objects', body);
	}

	update(id: number, body: CreateObjectData) {
		return this.http.put<ObjectData[]>(`/api/objects/${id}`, body);
	}

	remove(id: number) {
		return this.http.delete<void>(`/api/objects/${id}`);
	}
}
