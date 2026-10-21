import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostEntity, PostInput, PostGroupData } from '../models/post.model';

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

	findFromMyGroups() {
		return this.http.get<PostEntity[]>('/api/posts/my-groups');
	}

	findGroups(postId: number) {
		return this.http.get<PostGroupData[]>(`/api/posts/${postId}/groups`);
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
