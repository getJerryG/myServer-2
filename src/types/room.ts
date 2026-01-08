import { Socket } from "socket.io";

/**
 * 用户角色枚举
 * 定义房间内用户的不同角色
 */
export enum UserRole {
    OWNER = "OWNER", // 房间所有者
    JUDGE = "JUDGE", // 裁判
    ADMIN = "ADMIN", // 管理员
    PLAYER = "PLAYER", // 普通玩家
}

/**
 * 房间错误类型枚举
 * 定义房间操作中可能出现的错误类型
 */
export enum RoomErrorType {
    PERMISSION_DENIED = "PERMISSION_DENIED", // 权限不足
    INVALID_SEAT = "INVALID_SEAT", // 无效座位
    ROOM_FULL = "ROOM_FULL", // 房间已满
    PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND", // 玩家未找到
    INVALID_OPERATION = "INVALID_OPERATION", // 无效操作
    ROOM_NOT_FOUND = "ROOM_NOT_FOUND", // 房间未找到
    INVALID_STATE = "INVALID_STATE", // 无效状态
    SeatError = "SeatError", // 座位错误
    PLAYER_DEAD = "PLAYER_DEAD", // 玩家已死亡
}

/**
 * 房间错误接口
 * 定义房间错误的结构
 */
export interface IRoomError {
    code?: RoomErrorType;
    message: string;
    status: number;
}

/**
 * 错误事件接口
 * 定义WebSocket错误事件的结构
 */
export interface IErrorEvent {
    type: "ERROR";
    code: string;
    message: string;
    timestamp: number;
}

/**
 * 用户接口
 * 定义用户的基本信息
 */
export interface IUser {
    id: number;
    username: string;
    role?: UserRole;
}

/**
 * 房间阶段枚举
 * 定义游戏的不同阶段
 */
export enum IRoomStage {
    NOSTART = "NOSTART", // 未开始
    NIGHT = "NIGHT", // 夜晚
    DAY = "DAY" // 白天
}

/**
 * 房间配置接口
 * 定义房间的配置选项
 */
export interface IRoomConfig {
    maxPlayers: number;
    allowSpectators: boolean;
    password?: string;
    gameType: string;
}

/**
 * 房间状态枚举
 * 定义房间的不同状态
 */
export enum RoomState {
    WAITING = "WAITING", // 等待中
    PLAYING = "PLAYING", // 游戏中
    FINISHED = "FINISHED", // 已结束
    CLOSE = "CLOSE", // 已关闭
    PAUSED = "PAUSED" // 已暂停
}

/**
 * 房间成员接口
 * 定义房间成员的信息
 */
export interface IRoomMember {
    user: IUser;
    role: UserRole;
    socket: Socket;
    seatNumber?: number;
    state: "ACTIVE" | "INACTIVE";
    joinedAt: Date;
}

/**
 * 房间接口
 * 定义房间的完整结构
 */
export interface IRoom {
    id: string;
    name: string;
    owner: IUser;
    config: IRoomConfig;
    state: RoomState;
    members: Map<number, IRoomMember>;
    created: Date;
    lastActive: Date;
}

/**
 * JWT负载接口
 * 定义JWT令牌的负载结构
 */
export interface IJwtPayload {
    userId: number;
    openId: string;
    iat?: number;
    exp?: number;
    permission?: number;
}

/**
 * 管理员JWT负载接口
 * 定义管理员JWT令牌的负载结构
 */
export interface IAdminJwtPayload {
    userId?: number;
    openId?: string;
    iat?: number;
    exp?: number;
    permission?: number;
}

/**
 * 房间权限配置
 * 定义不同角色的操作权限
 */
export const RoomPermissions = {
    [UserRole.OWNER]: ["*"], // 所有者拥有所有权限
    [UserRole.JUDGE]: ["KICK_PLAYER", "MUTE_PLAYER", "START_GAME", "PAUSE_GAME", "END_GAME", "MODIFY_GAME_STATE"],
    [UserRole.ADMIN]: ["KICK_PLAYER", "MUTE_PLAYER", "MODIFY_ROOM_SETTINGS"],
    [UserRole.PLAYER]: ["SEND_MESSAGE", "MAKE_MOVE", "LEAVE_ROOM"]
};

/**
 * 房间操作枚举
 * 定义房间内允许的操作类型
 */
export enum RoomOperation {
    KICK_PLAYER = "KICK_PLAYER", // 踢出玩家
    MUTE_PLAYER = "MUTE_PLAYER", // 禁言玩家
    START_GAME = "START_GAME", // 开始游戏
    PAUSE_GAME = "PAUSE_GAME", // 暂停游戏
    END_GAME = "END_GAME", // 结束游戏
    MODIFY_GAME_STATE = "MODIFY_GAME_STATE", // 修改游戏状态
    MODIFY_ROOM_SETTINGS = "MODIFY_ROOM_SETTINGS", // 修改房间设置
    SEND_MESSAGE = "SEND_MESSAGE", // 发送消息
    MAKE_MOVE = "MAKE_MOVE", // 进行游戏操作
    LEAVE_ROOM = "LEAVE_ROOM" // 离开房间
};