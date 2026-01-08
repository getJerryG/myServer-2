import { Schema } from "mongoose";

/**
 * JWT负载接口
 */
export interface IJwtPayload {
    user_id: Schema.Types.ObjectId;
    username: string;
    role: string;
    exp?: number;
    iat?: number;
}

/**
 * 管理员JWT负载接口
 */
export interface IAdminJwtPayload {
    admin_id: Schema.Types.ObjectId;
    username: string;
    role: string;
    exp?: number;
    iat?: number;
}
