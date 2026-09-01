import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObjectData } from '../models/object-data.model';

@Injectable({
	providedIn: 'root'
})

export class ObjectService {
	private http = inject(HttpClient)

	findAll() {
		return this.http.get<ObjectData[]>('/api/objects');
	}
}
