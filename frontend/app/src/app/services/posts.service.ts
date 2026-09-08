import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostData, PostForm } from '../models/post-data.model';

@Injectable({
	providedIn: 'root'
})

export class PostsService {
	private http = inject(HttpClient)

	findMy() {
		return this.http.get<PostData[]>('/api/posts/my');
	}

	findOne(postId: number) {
		return this.http.get<PostData>(`/api/posts/${postId}`);
	}

	findGroups(postId: number) {
		return this.http.get<{ id: number; name: string }[]>(`/api/posts/${postId}/groups`);
	}

	create(body: PostForm) {
		return this.http.post<PostData>('/api/posts', body);
	}

	update(postId: number, body: PostForm) {
		return this.http.put<PostData>(`/api/posts/${postId}`, body);
	}

	remove(postId: number) {
		return this.http.delete<{ message: string }>(`/api/posts/${postId}`);
	}
}
