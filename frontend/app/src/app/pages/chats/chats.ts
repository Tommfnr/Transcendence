import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ChatComponent } from '../../components/chats/chats';
import { ChatsService } from '../../services/chats.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { RefreshService } from '../../services/refresh.service';
import { LendingService } from '../../services/lending.service';
import { PostsService } from '../../services/posts.service';
import { GroupsService } from '../../services/groups.service';
import { ConversationWithMembers } from '../../models/chat.model';
import { LendingEntity } from '../../models/lending.model';
import { ExchangeTone, LENDING_STATUS_DISPLAY } from '../../models/exchange.model';
import { ExchangeRowComponent } from '../../components/exchange-row/exchange-row';
import { formatTimeAgo } from '../../shared/date-format';
import { TitleBarComponent } from '../../components/title-bar/title-bar';
import { ErrorBannerComponent } from '../../components/error-banner/error-banner';

// findMy is sorted by last activity; we keep that order as the list changes live
function sortByActivity(conversations: ConversationWithMembers[]): ConversationWithMembers[] {
    return [...conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

// Conversations page of the user
@Component({
    selector: 'app-chats',
    imports: [ChatComponent, TitleBarComponent, ExchangeRowComponent, ErrorBannerComponent],
    templateUrl: './chats.html',
})
export class Chats implements OnInit {
    private chatsService = inject(ChatsService);
    private chatSocket = inject(ChatSocketService);
    private refreshService = inject(RefreshService);
    private lendingService = inject(LendingService);
    private route = inject(ActivatedRoute);
    private postsService = inject(PostsService);
    private groupsService = inject(GroupsService);

    readonly conversationId = signal<number | null>(null);
    readonly loaded = signal(false);
    // Set when the chats service can't be reached, cleared when the list reloads after a reconnection
    protected readonly bannerErrors = signal<string[]>([]);
    protected readonly conversations = signal<ConversationWithMembers[]>([]);
    // Each conversation comes from an offer on a post; its status is shown like in My exchanges
    private readonly lendings = signal<LendingEntity[]>([]);

    protected readonly selected = computed(
        () => this.conversations().find(({ id }) => id === this.conversationId()) ?? null,
    );

    // Name of a group of the post that both members are in, loaded once per conversation
    private readonly groupNameByConversation = signal<Map<number, string>>(new Map());
    protected readonly groupName = computed(() => {
        const conversation = this.selected();
        return conversation ? (this.groupNameByConversation().get(conversation.id) ?? '') : '';
    });

    constructor() {
        // The header shows the shared group of the open conversation
        effect(() => {
            const conversation = this.selected();
            if (conversation && !untracked(this.groupNameByConversation).has(conversation.id))
                untracked(() => this.loadSharedGroup(conversation));
        });

        // A conversation someone else started with us shows up without a reload
        this.chatSocket.conversationNew$
            .pipe(takeUntilDestroyed())
            .subscribe(({ conversation }) => this.upsertConversation(conversation));

        this.chatSocket.reconnected$
            .pipe(
                switchMap(() => this.chatsService.findMy().pipe(catchError(() => EMPTY))),
                takeUntilDestroyed(),
            )
            .subscribe((conversations) => {
                this.conversations.set(sortByActivity(conversations));
                this.bannerErrors.set([]);
            });

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
        this.chatsService.findMy().subscribe({
            next: (conversations) => {
                this.conversations.set(sortByActivity(conversations));
                // My exchanges links here with ?post=<id>, the Offers modal adds &with=<offerer id>;
                // otherwise the most recent one opens
                const params = this.route.snapshot.queryParamMap;
                const postId = Number(params.get('post'));
                const withId = params.has('with') ? Number(params.get('with')) : null;
                const opened = this.conversations().find((conversation) =>
                    conversation.post.id === postId
                    && (withId === null || conversation.members.some((member) => member.id === withId)))
                    ?? this.conversations()[0];
                this.conversationId.set(opened?.id ?? null);
                this.loaded.set(true);
            },
            error: () => {
                this.bannerErrors.set(['Could not load your conversations']);
                this.loaded.set(true);
            },
        });

        this.lendingService.listAll().subscribe({
            next: (lendings) => this.lendings.set(lendings),
            // Without lendings the chats still work, only the offer details are missing
            error: () => this.lendings.set([]),
        });
    }

    // Who we are talking to: everyone in the conversation but us
    protected peers(conversation: ConversationWithMembers): string {
        const meId = this.refreshService.user()?.id;
        const names = conversation.members
            .filter((member) => member.id !== meId)
            .map((member) => member.username);

        // A conversation whose other member deleted their account keeps a usable label
        return names.length > 0 ? names.join(', ') : 'Deleted user';
    }

    // The offer behind a conversation: same post, between the same two people (listAll is newest first)
    private offerOf(conversation: ConversationWithMembers): LendingEntity | undefined {
        const memberIds = new Set(conversation.members.map((member) => member.id));
        return this.lendings().find((l) =>
            l.postId === conversation.post.id && memberIds.has(l.lenderId) && memberIds.has(l.borrowerId));
    }

    // Same content as a My exchanges row in the dashboard: post → who, role and when, then the offer status
    protected exchangeRow(conversation: ConversationWithMembers): {
        title: string;
        subtitle: string;
        statusLabel: string;
        tone: ExchangeTone;
    } {
        const offer = this.offerOf(conversation);
        const title = `${conversation.post.title} → ${this.peers(conversation)}`;
        const timeAgo = formatTimeAgo(conversation.updatedAt);

        // A conversation without its offer (deleted, or still loading) keeps the title and the time
        if (!offer)
            return { title, subtitle: timeAgo, statusLabel: '', tone: 'waiting' };

        const role = offer.lenderId === this.refreshService.user()?.id ? 'my offer' : 'my request';
        return {
            title,
            subtitle: `${role} · ${timeAgo}`,
            statusLabel: LENDING_STATUS_DISPLAY[offer.status].label,
            tone: LENDING_STATUS_DISPLAY[offer.status].tone,
        };
    }

    // Same rule as the Offers modal: among the groups of the post, the first one every member belongs to
    private loadSharedGroup(conversation: ConversationWithMembers): void {
        const memberIds = conversation.members.map((member) => member.id);

        this.postsService.findGroups(conversation.post.id).pipe(
            switchMap((groups) => groups.length === 0 ? of([]) : forkJoin(groups.map((group) =>
                this.groupsService.findMembers(group.id).pipe(
                    map((members) => ({ group, userIds: members.map((member) => member.userId) })),
                    // A group we are not in refuses its member list: it can't be the shared one
                    catchError(() => of({ group, userIds: [] as number[] })),
                ),
            ))),
            catchError(() => of([])),
        ).subscribe((results) => {
            const shared = results.find(({ userIds }) => memberIds.every((id) => userIds.includes(id)));
            this.groupNameByConversation.update((names) =>
                new Map(names).set(conversation.id, shared?.group.name ?? ''));
        });
    }

    protected select(conversationId: number): void {
        this.conversationId.set(conversationId);
    }

    // The list is keyed by id so a conversation already shown is never duplicated
    private upsertConversation(conversation: ConversationWithMembers): void {
        this.conversations.update((current) => {
            const others = current.filter((item) => item.id !== conversation.id);
            return sortByActivity([conversation, ...others]);
        });
    }
}
