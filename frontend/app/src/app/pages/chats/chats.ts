import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ChatComponent } from '../../components/chats/chats';
import { ButtonDirective } from '../../components/button/button.directive';
import { ChatsService } from '../../services/chats.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { UsersService } from '../../services/users.service';
import { RefreshService } from '../../services/refresh.service';
import { ConversationWithMembers } from '../../models/chat.model';
import { User } from '../../models/user.model';
import { TitleBarComponent } from '../../components/title-bar/title-bar';

// Same limit as messageContentSchema in the backend
const MESSAGE_MAX_LENGTH = 2000;

// findMy is sorted by last activity; we keep that order as the list changes live
function sortByActivity(conversations: ConversationWithMembers[]): ConversationWithMembers[] {
    return [...conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

// Conversations page of the user
@Component({
    selector: 'app-chats',
    imports: [ChatComponent, ButtonDirective, DatePipe, TitleBarComponent],
    templateUrl: './chats.html',
})
export class Chats implements OnInit {
    private chatsService = inject(ChatsService);
    private chatSocket = inject(ChatSocketService);
    private usersService = inject(UsersService);
    private refreshService = inject(RefreshService);

    readonly conversationId = signal<number | null>(null);
    readonly loaded = signal(false);
    protected readonly conversations = signal<ConversationWithMembers[]>([]);

    protected readonly selected = computed(
        () => this.conversations().find(({ id }) => id === this.conversationId()) ?? null,
    );

    protected readonly maxLength = MESSAGE_MAX_LENGTH;
    protected readonly recipientId = signal<number | null>(null);
    protected readonly firstMessage = signal('');
    protected readonly creating = signal(false);
    protected readonly createError = signal<string | null>(null);

    // The backend refuses a conversation with yourself, so we never offer it
    private readonly users = signal<User[]>([]);
    protected readonly recipients = computed(() => {
        const meId = this.refreshService.user()?.id;
        return this.users().filter((user) => user.id !== meId);
    });

    protected readonly canCreate = computed(
        () =>
            this.recipientId() !== null &&
            this.firstMessage().trim().length > 0 &&
            this.firstMessage().length <= MESSAGE_MAX_LENGTH &&
            !this.creating(),
    );

    constructor() {
        // A conversation someone else started with us shows up without a reload
        this.chatSocket.conversationNew$
            .pipe(takeUntilDestroyed())
            .subscribe(({ conversation }) => this.upsertConversation(conversation));

        // Any new message bumps its conversation back to the top of the list
        this.chatSocket.messageNew$.pipe(takeUntilDestroyed()).subscribe((message) => {
            this.conversations.update((current) =>
                sortByActivity(
                    current.map((conversation) =>
                        conversation.id === message.conversationId
                            ? { ...conversation, updatedAt: message.createdAt }
                            : conversation,
                    ),
                ),
            );
        });
    }

    ngOnInit(): void {
        this.chatsService.findMy().subscribe((conversations) => {
            this.conversations.set(sortByActivity(conversations));
            // The most recent one opens by default
            this.conversationId.set(this.conversations()[0]?.id ?? null);
            this.loaded.set(true);
        });

        this.usersService.findAll().subscribe((users) => this.users.set(users));
    }

    // Who we are talking to: everyone in the conversation but us
    protected peers(conversation: ConversationWithMembers): string {
        const meId = this.refreshService.user()?.id;
        const names = conversation.members
            .filter((member) => member.id !== meId)
            .map((member) => member.username);

        // A conversation whose other member deleted their account keeps a usable label
        return names.length > 0 ? names.join(', ') : 'Utilisateur supprimé';
    }

    protected select(conversationId: number): void {
        this.conversationId.set(conversationId);
    }

    protected onRecipientChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        this.recipientId.set(value ? Number(value) : null);
    }

    protected onFirstMessageInput(event: Event): void {
        this.firstMessage.set((event.target as HTMLInputElement).value);
    }

    // A conversation needs its first message: the backend creates both in one call
    protected createConversation(): void {
        const recipientId = this.recipientId();
        if (!this.canCreate() || recipientId === null) return;

        this.creating.set(true);
        this.createError.set(null);
        this.chatsService
            .create(recipientId, this.firstMessage().trim())
            .pipe(finalize(() => this.creating.set(false)))
            .subscribe({
                next: ({ conversation }) => {
                    this.firstMessage.set('');
                    this.recipientId.set(null);
                    this.upsertConversation(conversation);
                    // Show the fresh conversation right away
                    this.conversationId.set(conversation.id);
                },
                error: (err: HttpErrorResponse) => this.showError(err),
            });
    }

    // The creator is told twice (POST response + socket), so the list is keyed by id
    private upsertConversation(conversation: ConversationWithMembers): void {
        this.conversations.update((current) => {
            const others = current.filter((item) => item.id !== conversation.id);
            return sortByActivity([conversation, ...others]);
        });
    }

    private showError(err: HttpErrorResponse): void {
        const fieldErrors = err.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : '';
        this.createError.set(fieldErrors || err.error?.message || 'Une erreur est survenue');
    }
}
