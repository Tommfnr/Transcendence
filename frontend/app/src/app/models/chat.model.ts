export interface ConversationEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationMember {
    id: number;
    username: string;
}

// The post the conversation is about; title is 'Object deleted' once the post is gone
export interface ConversationPost {
    id: number;
    title: string;
}

// What findMy and a freshly created conversation return: the plain row plus who is in it and its post
export interface ConversationWithMembers extends ConversationEntity {
    members: ConversationMember[];
    post: ConversationPost;
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
