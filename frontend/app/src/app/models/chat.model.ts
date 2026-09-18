export interface ConversationEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationMember {
    id: number;
    username: string;
}

// What findMy and a freshly created conversation return: the plain row plus who is in it
export interface ConversationWithMembers extends ConversationEntity {
    members: ConversationMember[];
}

export interface MessageEntity {
    id: number;
    conversationId: number;
    ownerId: number;
    content: string;
    createdAt: string;
}

export interface ConversationCreated {
    conversation: ConversationWithMembers;
    message: MessageEntity;
}
