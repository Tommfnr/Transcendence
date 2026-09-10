import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostEntity, PostInput } from '../models/post.model';

@Injectable({
	providedIn: 'root'
})

export class PostsService {
	private http = inject(HttpClient)

	findMy() {
		return this.http.get<PostEntity[]>('/api/posts/my');
	}

	findOne(postId: number) {
		return this.http.get<PostEntity>(`/api/posts/${postId}`);
	}

	findGroups(postId: number) {
		return this.http.get<{ id: number; name: string }[]>(`/api/posts/${postId}/groups`);
	}

	create(body: PostInput) {
		return this.http.post<PostEntity>('/api/posts', body);
	}

	update(postId: number, body: PostInput) {
		return this.http.put<PostEntity>(`/api/posts/${postId}`, body);
	}

	remove(postId: number) {
		return this.http.delete<{ message: string }>(`/api/posts/${postId}`);
	}
}
