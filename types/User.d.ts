import { Document, Schema } from "mongoose";

/**
 * 用户接口定义
 */
export interface IUser extends Document {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: 0 | 1 | 2;
    avatar: string;
    exp: number;
    createTime: Date;
    updateTime: Date;
    status: 0 | 1 | 2 | 3; // 0: 正常, 1: 禁用, 2: 注销, 3: 其他
    role: 0 | 1 | 2; // 0: 普通用户, 1: 赛事管理员, 2: 系统管理员
    loginCount: number;
    lastLoginTime: Date;
    session_key: string; // 微信会话密钥
    signIn: {
        signInDays: number;
        lastSignInTime: Date;
    };
    permission: number;
}

/**
 * 用户查询条件类型
 */
export type TUserFind = Partial<Pick<IUser, "nickname" | "gamename" | "userId" | "userID" | "openId" | "session_key">>;

/**
 * 用户类型定义
 */
export type UserType = Partial<
    Pick<IUser, "nickname" | "gamename" | "avatar" | "status" | "role" | "sex" | "openId" | "session_key">
>;

/**
 * 用户基本信息类型
 */
export type UserBasicInfo = Partial<Pick<IUser, "nickname" | "gamename" | "avatar" | "sex">>;
