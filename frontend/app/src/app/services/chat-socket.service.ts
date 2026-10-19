import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { RefreshService } from './refresh.service';
import { ConversationCreated, MessageEntity } from '../models/chat.model';

// Must match CHAT_EVENTS in the backend chats.gateway.ts
interface ServerToClientEvents {
    'conversation:new': (created: ConversationCreated) => void;
    'message:new': (message: MessageEntity) => void;
}

// The server kicks sockets whose token is invalid, which usually means it expired (60s lifetime).
// We refresh and retry once, but never more than once per cooldown so a real rejection can't loop.
const RETRY_COOLDOWN_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
    private refreshService = inject(RefreshService);
    private socket: Socket<ServerToClientEvents> | null = null;
    private lastRetryAt = 0;

    private conversationNewSubject = new Subject<ConversationCreated>();
    private messageNewSubject = new Subject<MessageEntity>();
    private reconnectedSubject = new Subject<void>();
    private hasConnected = false;

    readonly connected = signal(false);
    readonly reconnected$ = this.reconnectedSubject.asObservable();
    readonly conversationNew$ = this.conversationNewSubject.asObservable();
    readonly messageNew$ = this.messageNewSubject.asObservable();

    connect(): void {
        if (this.socket) return;

        this.socket = io({
            path: '/api/socket.io',
            // A function, not an object: it is called again on every reconnection, so the current token is sent
            auth: (cb) => cb({ token: this.refreshService.getAccessToken() }),
        });

        this.socket.on('connect', () => {
            this.connected.set(true);
            if (this.hasConnected) this.reconnectedSubject.next();
            this.hasConnected = true;
        });
        this.socket.on('disconnect', (reason) => {
            this.connected.set(false);
            // Socket.IO does not reconnect by itself after a server-side kick
            if (reason === 'io server disconnect') this.retryWithFreshToken();
        });
        this.socket.on('conversation:new', (created) => this.conversationNewSubject.next(created));
        this.socket.on('message:new', (message) => this.messageNewSubject.next(message));
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.hasConnected = false;
        this.connected.set(false);
    }

    private retryWithFreshToken(): void {
        if (Date.now() - this.lastRetryAt < RETRY_COOLDOWN_MS) return;
        this.lastRetryAt = Date.now();

        this.refreshService.refreshToken().subscribe({
            next: () => this.socket?.connect(),
            error: () => this.disconnect(),
        });
    }
}
