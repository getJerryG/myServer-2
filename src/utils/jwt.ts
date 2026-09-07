import jwt from "jsonwebtoken";
import { IJwtPayload } from "~/User";
import { PermissionString } from "@/models/permission/types/permission-types";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";
import UserRoleService from "@/models/permission/services/UserRoleService";

type ExpiresIn = jwt.SignOptions["expiresIn"];

export interface IJwtPayloadExtended extends IJwtPayload {
    permissions?: PermissionString[];
    roles?: string[];
}

export const createToken = async (
    payload: Omit<IJwtPayload, "iat" | "exp">,
    expiresIn?: ExpiresIn): Promise<{ token: string; permissions: PermissionString[]; roles: string[] }> => {
    expiresIn = expiresIn || (process.env["EXPIRES_IN"] as ExpiresIn) || "1h";
    const token = jwt.sign(payload, process.env["JWT_SECRET"] as jwt.Secret, { expiresIn });

    const { userId } = payload;
    const uid = String(userId);
    const permissions = await UserRoleService.getUserPermissions(uid);
    const roles = await UserRoleService.getUserRoleCodes(uid);

    await PermissionCacheService.setUserPermissions(uid, permissions, roles);
    await PermissionCacheService.setTokenMapping(uid, token);

    return { token, permissions, roles };
};

export const createAdminToken = async (
    payload: Omit<IJwtPayload, "role" | "iat" | "exp">,
    expiresIn?: ExpiresIn): Promise<{ token: string; permissions: PermissionString[]; roles: string[] }> => {
    expiresIn = expiresIn || (process.env["EXPIRES_IN"] as ExpiresIn) || "1h";
    const token = jwt.sign(payload, process.env["JWT_SECRET"] as jwt.Secret, { expiresIn });

    const { userId } = payload;
    const uid = String(userId);
    const permissions = await UserRoleService.getUserPermissions(uid);
    const roles = await UserRoleService.getUserRoleCodes(uid);

    await PermissionCacheService.setUserPermissions(uid, permissions, roles);
    await PermissionCacheService.setTokenMapping(uid, token);

    return { token, permissions, roles };
};

export const verifyToken = async (token: string): Promise<IJwtPayloadExtended | null> => {
    try {
        const decoded = jwt.verify(token, process.env["JWT_SECRET"] as jwt.Secret) as IJwtPayloadExtended;
        return decoded;
    } catch (error) {
        console.error(`Error verifying token ${token}:`, error);
        return null;
    }
};