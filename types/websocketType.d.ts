/**
 * WebSocket消息类型枚举
 */
export enum MessageType {
    CHAT = "chat",
    GAME_ACTION = "gameAction",
    SYSTEM_NOTIFICATION = "systemNotification",
    USER_STATUS = "userStatus",
    GAME_STATUS = "gameStatus"
}

/**
 * WebSocket消息接口
 */
export interface Message {
    type: MessageType;
    content: Record<string, unknown>;
    senderId?: string;
    receiverId?: string;
    timestamp?: number;
    roomId?: string;
    messageId?: string;
}

/**
 * 聊天消息接口
 */
export interface ChatMessage extends Message {
    type: MessageType.CHAT;
    content: {
        text: string;
        images?: string[];
        emojis?: string[];
    };
}

/**
 * 游戏动作消息接口
 */
export interface GameActionMessage extends Message {
    type: MessageType.GAME_ACTION;
    content: {
        action: string;
        data: Record<string, unknown>;
    };
}

/**
 * 系统通知消息接口
 */
export interface SystemNotificationMessage extends Message {
    type: MessageType.SYSTEM_NOTIFICATION;
    content: {
        title: string;
        message: string;
        data?: Record<string, unknown>;
    };
}

/**
 * 用户状态消息接口
 */
export interface UserStatusMessage extends Message {
    type: MessageType.USER_STATUS;
    content: {
        userId: string;
        status: string;
        data?: Record<string, unknown>;
    };
}

/**
 * 游戏状态消息接口
 */
export interface GameStatusMessage extends Message {
    type: MessageType.GAME_STATUS;
    content: {
        gameId: string;
        status: string;
        data?: Record<string, unknown>;
    };
}
