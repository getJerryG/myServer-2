import { Document, Schema } from "mongoose";
import type { Timestamps } from "~/base-types";

export type UserStatus = 0 | 1 | 2 | 3;

export type UserRole = 0 | 1 | 2;

export type UserSex = 0 | 1 | 2;

export interface UserSignIn {
    signInDays: number;
    lastSignInTime: Date;
}

export interface UserBase extends Timestamps {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: UserSex;
    avatar: string;
    exp: number;
    status: UserStatus;
    role: UserRole;
    loginCount: number;
    lastLoginTime: Date;
    session_key: string;
    signIn: UserSignIn;
    permission: number;
}

export type IUser = UserBase & Document;

export type TUserFind = Partial<Pick<UserBase, "nickname" | "gamename" | "userId" | "userID" | "openId" | "session_key">>;

export type UserType = Partial<Pick<UserBase, "nickname" | "gamename" | "avatar" | "status" | "role" | "sex" | "openId" | "session_key">>;

export type UserBasicInfo = Partial<Pick<UserBase, "nickname" | "gamename" | "avatar" | "sex">>;
