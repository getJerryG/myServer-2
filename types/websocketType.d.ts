
export enum MessageType {
    CHAT = "chat",
    GAME_ACTION = "gameAction",
    SYSTEM_NOTIFICATION = "systemNotification",
    USER_STATUS = "userStatus",
    GAME_STATUS = "gameStatus"
}

export interface MessageBase<T extends MessageType = MessageType> {
    type: T;
    content: Record<string, unknown>;
    senderId?: string;
    receiverId?: string;
    timestamp?: number;
    roomId?: string;
    messageId?: string;
}

export type Message<T extends MessageType = MessageType> = MessageBase<T>;

export type ChatContent = {
    text: string;
    images?: string[];
    emojis?: string[];
};

export type GameActionContent = {
    action: string;
    data: Record<string, unknown>;
};

export type SystemNotificationContent = {
    title: string;
    message: string;
    data?: Record<string, unknown>;
};

export type UserStatusContent = {
    userId: string;
    status: string;
    data?: Record<string, unknown>;
};

export type GameStatusContent = {
    gameId: string;
    status: string;
    data?: Record<string, unknown>;
};

export type ChatMessage = Message<MessageType.CHAT> & { content: ChatContent };
export type GameActionMessage = Message<MessageType.GAME_ACTION> & { content: GameActionContent };
export type SystemNotificationMessage = Message<MessageType.SYSTEM_NOTIFICATION> & { content: SystemNotificationContent };
export type UserStatusMessage = Message<MessageType.USER_STATUS> & { content: UserStatusContent };
export type GameStatusMessage = Message<MessageType.GAME_STATUS> & { content: GameStatusContent };

export type AnyMessage = 
    | ChatMessage 
    | GameActionMessage 
    | SystemNotificationMessage 
    | UserStatusMessage 
    | GameStatusMessage;

export type MessageContentByType<T extends MessageType> = 
    T extends MessageType.CHAT 
        ? ChatContent 
        : T extends MessageType.GAME_ACTION 
            ? GameActionContent 
            : T extends MessageType.SYSTEM_NOTIFICATION 
                ? SystemNotificationContent 
                : T extends MessageType.USER_STATUS 
                    ? UserStatusContent 
                    : T extends MessageType.GAME_STATUS 
                        ? GameStatusContent 
                        : Record<string, unknown>;

export type TypedMessage<T extends MessageType> = Message<T> & { content: MessageContentByType<T> };
