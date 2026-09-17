import { Component, OnInit, inject, signal } from '@angular/core';
import { ChatComponent } from '../../components/chat/chat';
import { ChatsService } from '../../services/chats.service';

// Preview of the chat component on the most recent conversation of the user
@Component({
    selector: 'app-chatPreview',
    imports: [ChatComponent],
    templateUrl: './chatPreview.html',
})
export class ChatPreview implements OnInit {
    private chatsService = inject(ChatsService);

    readonly conversationId = signal<number | null>(null);
    readonly loaded = signal(false);

    ngOnInit(): void {
        // findMy is sorted by last activity, so the first one is the most recent
        this.chatsService.findMy().subscribe((conversations) => {
            this.conversationId.set(conversations[0]?.id ?? null);
            this.loaded.set(true);
        });
    }
}
