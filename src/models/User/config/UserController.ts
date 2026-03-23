import mongoose, { Schema } from "mongoose";

// 定义用户控制器数据接口，使用与 types/User.d.ts 中 UserBase 一致的字段
export interface UserControllerData {
    nickname?: string;
    avatar?: string;
    status?: 0 | 1 | 2 | 3 | 4;
    role?: 0 | 1 | 2;
    user_title?: Schema.Types.ObjectId[];
    openId?: string;
    session_key?: string;
    sex?: 0 | 1 | 2;
    permission?: number;
}

export default class UserController {
    nickname: string;
    avatar: string | undefined;
    status: 0 | 1 | 2 | 3 | 4; // 0: 离线, 1: 在线, 2: 游戏中, 3: 观战中, 4: 房间中
    role: 0 | 1 | 2; // 0: 普通玩家, 1: 管理员, 2: 超级管理员
    user_title: mongoose.Schema.Types.ObjectId[];
    openId: string;
    session_key: string;
    sex: 0 | 1 | 2; // 0: 未知, 1: 男
    permission: number;

    constructor(userData: UserControllerData = {}) {
        this.nickname = userData.nickname || "";
        this.avatar = userData.avatar;
        this.status = userData.status ?? 0;
        this.role = userData.role ?? 0;
        this.user_title = userData.user_title || [];
        this.openId = userData.openId || "";
        this.session_key = userData.session_key || "";
        this.sex = userData.sex ?? 0;
        this.permission = userData.permission ?? 0;
    }
}