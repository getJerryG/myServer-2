import jwt from "jsonwebtoken";
import { IJwtPayload } from "~/User";
import { IAdminJwtPayload } from "~/types/room";

type ExpiresIn = jwt.SignOptions["expiresIn"];

/**
 * 创建JWT token
 * @param payload token载荷
 * @param expiresIn 过期时间
 * @returns JWT token
 */
export const createToken = (payload: Omit<IJwtPayload, "iat" | "exp">, expiresIn?: ExpiresIn): string => {
    expiresIn = expiresIn || (process.env["EXPIRES_IN"] as ExpiresIn) || "1h";
    return jwt.sign(payload, process.env["JWT_SECRET"] as jwt.Secret, { expiresIn });
};

/**
 * 创建管理员JWT token
 * @param payload token载荷
 * @param expiresIn 过期时间
 * @returns JWT token
 */
export const createAdminToken = (payload: Omit<IAdminJwtPayload, "iat" | "exp">, expiresIn?: ExpiresIn): string => {
    expiresIn = expiresIn || (process.env["EXPIRES_IN"] as ExpiresIn) || "1h";
    return jwt.sign(payload, process.env["JWT_SECRET"] as jwt.Secret, { expiresIn });
};

/**
 * 验证JWT token
 * @param token JWT token
 * @returns 验证后的token载荷
 */
export const verifyToken = (token: string): IJwtPayload | IAdminJwtPayload | null => {
    try {
        return jwt.verify(token, process.env["JWT_SECRET"] as jwt.Secret) as IJwtPayload | IAdminJwtPayload;
    } catch (_error) {
        return null;
    }
};