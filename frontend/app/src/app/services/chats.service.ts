import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    ConversationCreated,
    ConversationEntity,
    ConversationWithMembers,
    MessageEntity,
} from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatsService {
    private http = inject(HttpClient);

    findMy() {
        return this.http.get<ConversationWithMembers[]>('/api/chats/my');
    }

    findOne(conversationId: number) {
        return this.http.get<ConversationEntity>(`/api/chats/${conversationId}`);
    }

    findMessages(conversationId: number) {
        return this.http.get<MessageEntity[]>(`/api/chats/${conversationId}/messages`);
    }

    create(recipientId: number, postId: number, content: string) {
        return this.http.post<ConversationCreated>('/api/chats', { recipientId, postId, content });
    }

    sendMessage(conversationId: number, content: string) {
        return this.http.post<MessageEntity>(`/api/chats/${conversationId}/messages`, { content });
    }
}
