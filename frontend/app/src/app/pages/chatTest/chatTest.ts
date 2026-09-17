import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../components/button/button';
import { ChatsService } from '../../services/chats.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { RefreshService } from '../../services/refresh.service';
import { UsersService } from '../../services/users.service';
import { ConversationEntity, MessageEntity } from '../../models/chat.model';
import { User } from '../../models/user.model';

// Merges two message lists without duplicates: the sender gets its own message
// both in the POST response and through the socket
function mergeMessages(current: MessageEntity[], incoming: MessageEntity[]): MessageEntity[] {
    const byId = new Map([...current, ...incoming].map((message) => [message.id, message]));
    return [...byId.values()].sort((a, b) => a.id - b.id);
}

// Debug page to exercise the chat API and websocket, not meant for end users
@Component({
    selector: 'app-chatTest',
    imports: [DatePipe, ButtonComponent],
    templateUrl: './chatTest.html',
})
export class ChatTest implements OnInit, OnDestroy {
    private chatsService = inject(ChatsService);
    private usersService = inject(UsersService);
    private refreshService = inject(RefreshService);
    readonly socket = inject(ChatSocketService);

    readonly me = this.refreshService.user;
    readonly users = signal<User[]>([]);
    readonly otherUsers = computed(() => this.users().filter((user) => user.id !== this.me()?.id));
    readonly usernames = computed(
        () => new Map(this.users().map((user) => [user.id, user.username])),
    );

    readonly conversations = signal<ConversationEntity[]>([]);
    readonly selectedId = signal<number | null>(null);
    readonly messages = signal<MessageEntity[]>([]);
    readonly events = signal<string[]>([]);
    readonly error = signal<string | null>(null);

    constructor() {
        this.socket.conversationNew$
            .pipe(takeUntilDestroyed())
            .subscribe(({ conversation, message }) => {
                this.log(
                    `conversation:new #${conversation.id} (from ${this.usernameOf(message.ownerId)}): "${message.content}"`,
                );
                this.loadConversations();
            });

        this.socket.messageNew$.pipe(takeUntilDestroyed()).subscribe((message) => {
            this.log(
                `message:new #${message.conversationId} (from ${this.usernameOf(message.ownerId)}): "${message.content}"`,
            );
            if (message.conversationId === this.selectedId()) this.addMessages([message]);
            this.loadConversations();
        });
    }

    ngOnInit(): void {
        this.socket.connect();
        this.usersService.findAll().subscribe((users) => this.users.set(users));
        this.loadConversations();
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }

    usernameOf(userId: number): string {
        return this.usernames().get(userId) ?? `#${userId}`;
    }

    loadConversations(): void {
        this.chatsService
            .findMy()
            .subscribe((conversations) => this.conversations.set(conversations));
    }

    open(conversationId: number): void {
        this.selectedId.set(conversationId);
        this.messages.set([]);
        this.chatsService.findMessages(conversationId).subscribe((messages) => {
            // Ignore a late response if another conversation was opened meanwhile
            if (this.selectedId() === conversationId) this.addMessages(messages);
        });
    }

    startConversation(recipient: HTMLSelectElement, content: HTMLInputElement): void {
        this.error.set(null);
        this.chatsService.create(Number(recipient.value), content.value).subscribe({
            next: ({ conversation }) => {
                content.value = '';
                this.loadConversations();
                this.open(conversation.id);
            },
            error: (err: HttpErrorResponse) => this.showError(err),
        });
    }

    send(content: HTMLInputElement): void {
        const conversationId = this.selectedId();
        if (conversationId === null) return;

        this.error.set(null);
        this.chatsService.sendMessage(conversationId, content.value).subscribe({
            next: (message) => {
                content.value = '';
                this.addMessages([message]);
            },
            error: (err: HttpErrorResponse) => this.showError(err),
        });
    }

    private addMessages(messages: MessageEntity[]): void {
        this.messages.update((current) => mergeMessages(current, messages));
    }

    private log(line: string): void {
        const time = new Date().toLocaleTimeString();
        this.events.update((events) => [`${time}  ${line}`, ...events].slice(0, 30));
    }

    private showError(err: HttpErrorResponse): void {
        const fieldErrors = err.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : '';
        this.error.set(`${err.status} ${err.error?.message ?? err.message} ${fieldErrors}`.trim());
    }
}
