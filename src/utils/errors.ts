import { Socket } from "socket.io";
import type { Request, Response, NextFunction } from "express";

/**
 * 房间错误类型枚举
 */
export enum RoomErrorType {
    PERMISSION_DENIED = "PERMISSION_DENIED",
    INVALID_SEAT = "INVALID_SEAT",
    ROOM_FULL = "ROOM_FULL",
    ROOM_NOT_EXIST = "ROOM_NOT_EXIST",
    USER_NOT_IN_ROOM = "USER_NOT_IN_ROOM",
    GAME_ALREADY_STARTED = "GAME_ALREADY_STARTED",
    GAME_NOT_STARTED = "GAME_NOT_STARTED",
    INVALID_OPERATION = "INVALID_OPERATION",
    INVALID_PARAMETER = "INVALID_PARAMETER",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND",
    INVALID_STATE = "INVALID_STATE",
    PLAYER_DEAD = "PLAYER_DEAD"
}

/**
 * 错误事件接口
 */
export interface IErrorEvent {
    type: "ERROR";
    code: string;
    message: string;
    timestamp: number;
}

/**
 * 房间错误类，继承自 Error
 */
export class RoomError extends Error {
    constructor(
        public code: RoomErrorType,
        public message: string,
        public status = 400
    ) {
        super(message);
        this.name = "RoomError";

        // 捕获堆栈跟踪
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RoomError);
        }
    }

    /**
     * 转换为错误事件格式
     * @returns 错误事件对象
     */
    toErrorEvent(): IErrorEvent {
        return {
            type: "ERROR",
            code: this.code,
            message: this.message,
            timestamp: Date.now()
        };
    }
}

/**
 * 权限错误类
 */
export class PermissionError extends RoomError {
    constructor(message = "权限不足") {
        super(RoomErrorType.PERMISSION_DENIED, message, 403);
        this.name = "PermissionError";
    }
}

/**
 * 无效座位错误类
 */
export class InvalidSeatError extends RoomError {
    constructor(message = "无效的座位") {
        super(RoomErrorType.INVALID_SEAT, message, 400);
        this.name = "InvalidSeatError";
    }
}

/**
 * 房间已满错误类
 */
export class RoomFullError extends RoomError {
    constructor(message = "房间已满") {
        super(RoomErrorType.ROOM_FULL, message, 400);
        this.name = "RoomFullError";
    }
}

/**
 * 玩家未找到错误类
 */
export class PlayerNotFoundError extends RoomError {
    constructor(message = "玩家未找到") {
        super(RoomErrorType.PLAYER_NOT_FOUND, message, 404);
        this.name = "PlayerNotFoundError";
    }
}

/**
 * 无效操作错误类
 */
export class InvalidOperationError extends RoomError {
    constructor(message = "无效的操作") {
        super(RoomErrorType.INVALID_OPERATION, message, 400);
        this.name = "InvalidOperationError";
    }
}

/**
 * 房间未找到错误类
 */
export class RoomNotFoundError extends RoomError {
    constructor(message = "房间未找到") {
        super(RoomErrorType.ROOM_NOT_EXIST, message, 404);
        this.name = "RoomNotFoundError";
    }
}

/**
 * 无效状态错误类
 */
export class InvalidStateError extends RoomError {
    constructor(message = "无效的状态") {
        super(RoomErrorType.INVALID_STATE, message, 400);
        this.name = "InvalidStateError";
    }
}

/**
 * 玩家已死亡错误类
 */
export class PlayerDeadError extends RoomError {
    constructor(message = "玩家已死亡") {
        super(RoomErrorType.PLAYER_DEAD, message, 400);
        this.name = "PlayerDeadError";
    }
}

/**
 * 发送错误事件给单个 socket
 * @param socket Socket 实例
 * @param error 错误对象
 */
export const sendErrorEvent = (socket: Socket, error: RoomError): void => {
    const errorEvent = error.toErrorEvent();
    socket.emit("$room-error", errorEvent);
};

/**
 * 广播错误事件到房间
 * @param socket Socket 实例
 * @param roomId 房间 ID
 * @param error 错误对象
 */
export const broadcastErrorEvent = (socket: Socket, roomId: string, error: RoomError): void => {
    const errorEvent = error.toErrorEvent();
    socket.to(roomId).emit("$room-error", errorEvent);
    // 同时发送给发送者
    socket.emit("$room-error", errorEvent);
};

/**
 * Express 错误处理中间件
 * @param err 错误对象
 * @param req 请求对象
 * @param res 响应对象
 * @param _next 下一个中间件
 */
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    console.error(`Error occurred ${req.method} ${req.url}:`, err);

    if (err instanceof RoomError) {
        res.status(err.status).json({
            error: {
                code: err.code,
                message: err.message
            }
        });
    } else {
        res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "服务器内部错误"
            }
        });
    }
};
