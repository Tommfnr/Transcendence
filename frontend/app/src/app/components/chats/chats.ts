import {
    Component,
    ElementRef,
    afterRenderEffect,
    computed,
    effect,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ChatsService } from '../../services/chats.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { RefreshService } from '../../services/refresh.service';
import { MessageEntity } from '../../models/chat.model';

// Same limit as messageContentSchema in the backend
const MESSAGE_MAX_LENGTH = 2000;

// The sender gets its own message twice (POST response + socket), so lists are merged by id
function mergeMessages(current: MessageEntity[], incoming: MessageEntity[]): MessageEntity[] {
    const byId = new Map([...current, ...incoming].map((message) => [message.id, message]));
    return [...byId.values()].sort((a, b) => a.id - b.id);
}

/**
 * A whole conversation: history, live updates and the message composer.
 *
 * <app-chat [conversationId]="id" class="h-96">
 *     <h2>Optional header, projected on top</h2>
 * </app-chat>
 *
 * Give it a height: the message list scrolls inside whatever space the parent allows.
 * Live updates rely on ChatSocketService, which AppLayout connects for every /app page.
 */
@Component({
    selector: 'app-chat',
    imports: [DatePipe],
    templateUrl: './chats.html',
    host: { class: 'flex min-h-0 flex-col overflow-hidden rounded-card bg-card shadow-card' },
})
export class ChatComponent {
    private chatsService = inject(ChatsService);
    private chatSocket = inject(ChatSocketService);
    private refreshService = inject(RefreshService);

    readonly conversationId = input.required<number>();
    readonly placeholder = input('Écrire un message…');

    protected readonly maxLength = MESSAGE_MAX_LENGTH;
    protected readonly me = this.refreshService.user;
    protected readonly messages = signal<MessageEntity[]>([]);
    protected readonly loading = signal(false);
    protected readonly sending = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly draft = signal('');
    protected readonly canSend = computed(
        () =>
            this.draft().trim().length > 0 &&
            this.draft().length <= MESSAGE_MAX_LENGTH &&
            !this.sending(),
    );

    private scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

    constructor() {
        // (Re)load the history whenever the parent points us to another conversation
        effect((onCleanup) => {
            const conversationId = this.conversationId();
            this.messages.set([]);
            this.error.set(null);
            this.loading.set(true);

            const request = this.chatsService
                .findMessages(conversationId)
                .pipe(finalize(() => this.loading.set(false)))
                .subscribe({
                    next: (messages) => this.addMessages(messages),
                    error: (err: HttpErrorResponse) => this.showError(err),
                });

            // Drops a slow response if the conversation changed meanwhile
            onCleanup(() => request.unsubscribe());
        });

        this.chatSocket.messageNew$.pipe(takeUntilDestroyed()).subscribe((message) => {
            if (message.conversationId === this.conversationId()) this.addMessages([message]);
        });

        this.chatSocket.reconnected$.pipe(takeUntilDestroyed()).subscribe(() => {
            this.chatsService.findMessages(this.conversationId()).subscribe({
                next: (messages) => this.addMessages(messages),
            });
        });

        // Keep the latest message in view
        afterRenderEffect(() => {
            this.messages();
            const scroller = this.scroller().nativeElement;
            scroller.scrollTop = scroller.scrollHeight;
        });
    }

    protected onDraftInput(event: Event): void {
        this.draft.set((event.target as HTMLTextAreaElement).value);
    }

    protected send(): void {
        if (!this.canSend()) return;

        this.sending.set(true);
        this.error.set(null);
        this.chatsService
            .sendMessage(this.conversationId(), this.draft().trim())
            .pipe(finalize(() => this.sending.set(false)))
            .subscribe({
                next: (message) => {
                    this.draft.set('');
                    this.addMessages([message]);
                },
                error: (err: HttpErrorResponse) => this.showError(err),
            });
    }

    private addMessages(messages: MessageEntity[]): void {
        this.messages.update((current) => mergeMessages(current, messages));
    }

    private showError(err: HttpErrorResponse): void {
        const fieldErrors = err.error?.errors
            ? Object.values(err.error.errors).flat().join(', ')
            : '';
        this.error.set(fieldErrors || err.error?.message || 'Une erreur est survenue');
    }
}
