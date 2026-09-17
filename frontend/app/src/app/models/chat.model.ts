export interface ConversationEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface MessageEntity {
    id: number;
    conversationId: number;
    ownerId: number;
    content: string;
    createdAt: string;
}

export interface ConversationCreated {
    conversation: ConversationEntity;
    message: MessageEntity;
}
