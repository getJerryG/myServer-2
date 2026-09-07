import { Request, Response, NextFunction } from "express";
import { verifyToken, IJwtPayloadExtended } from "@/utils/jwt";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";
import UserRoleService from "@/models/permission/services/UserRoleService";

interface RequestWithAuth extends Request {
    user: IJwtPayloadExtended;
}

function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
        const token = parts[1];
        return token === undefined ? null : token;
    }
    return null;
}

/**
 * 认证中间件
 * 验证用户 token，加载权限到 req.user
 */
export async function authMiddleware(req: RequestWithAuth, res: Response, next: NextFunction) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            res.status(401).json({ errCode: 4011001, message: "缺少token" });
            return;
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            res.status(401).json({ errCode: 4011003, message: "token无效" });
            return;
        }

        const { userId } = decoded;
        let userPermissions = await PermissionCacheService.getUserPermissions(String(userId));

        if (!userPermissions) {
            const permissions = await UserRoleService.getUserPermissions(String(userId));
            const roles = await UserRoleService.getUserRoleCodes(String(userId));
            await PermissionCacheService.setUserPermissions(String(userId), permissions, roles);
            userPermissions = await PermissionCacheService.getUserPermissions(String(userId));
        }

        req.user = {
            ...decoded,
            permissions: userPermissions?.permissions || [],
            roles: userPermissions?.roles || []
        };

        next();
    } catch {
        res.status(401).json({ errCode: 4011002, message: "token过期" });
        return;
    }
}

export default authMiddleware;
