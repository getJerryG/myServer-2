import { Schema } from "mongoose";

/**
 * JWT负载接口
 */
export interface IJwtPayload {
    userId: number;
    username?: string;
    role?: string;
    permission: number;
    _id?: Schema.Types.ObjectId;
    exp?: number;
    iat?: number;
};