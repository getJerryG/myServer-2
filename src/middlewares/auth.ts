import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyToken, IJwtPayloadExtended } from "@/utils/jwt";
import { PermissionError } from "@/utils/errors";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";

type IUser = IJwtPayloadExtended | IAdminJwtPayload;

interface IAuth {
    user: IUser;
}

type SocketWithAuth = Socket & IAuth;

type RequestWithAuth = Request & IAuth;


/**
 * 认证中间件
 * @description 验证用户token
 * @returns 认证中间件
 */
export async function authMiddleware(req: RequestWithAuth, res: Response, next: NextFunction) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            return res.status(401).json({ errCode: 4011001, message: "缺少token" });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ errCode: 4011003, message: "token无效" });
        }

        const {userId} = decoded;
        const userPermissions = await PermissionCacheService.getUserPermissions(userId);

        if (!userPermissions) {
            const permissions = await UserRoleService.getUserPermissions(userId);
            const roles = await UserRoleService.getUserRoleCodes(userId);
            await PermissionCacheService.setUserPermissions(userId, permissions, roles);
        }

        req.user = {
            ...decoded,
            permissions: userPermissions?.permissions || [],
            roles: userPermissions?.roles || []
        };

        next();
    } catch {
        return res.status(401).json({ errCode: 4011002, message: "token过期" });
    }
};

/**
 * Socket.io JWT 身份验证中间件
 */
export const socketAuthMiddleware = async (
    socket: SocketWithAuth,
    next: (err?: ExtendedError) => void
) => {
    try {
        const { token } = socket.handshake.auth;
        if (!token) {
            throw new PermissionError("缺少身份验证令牌");
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            throw new PermissionError("身份验证失败");
        }

        socket.user = {
            id: decoded.userId,
            username: decoded.username || "",
            role: decoded.role as UserRole
        };

        next();
    } catch {
        next(new PermissionError("身份验证失败"));
    }
};

/**
 * 检查用户是否有权限执行特定操作
 * @param userRole 用户角色
 * @param operation 操作类型
 * @returns 是否有权限
 */
export const checkPermission = (
    userRole: UserRole,
    operation: RoomOperation
): boolean => {
    const allowedOperations = RoomPermissions[userRole];
    return allowedOperations.includes("*") || allowedOperations.includes(operation);
};

/**
 * 角色验证装饰器
 * @param requiredRoles 需要的角色
 */
export function RequireRole(requiredRoles: UserRole | UserRole[]) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            const socket = args[0] as SocketWithAuth;
            if (!socket.user) {
                throw new PermissionError("未通过身份验证");
            }

            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            if (!roles.includes(socket.user.role)) {
                throw new PermissionError("权限不足");
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

/**
 * 操作权限验证装饰器
 * @param operation 需要的操作权限
 */
export function RequirePermission(operation: RoomOperation) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            const socket = args[0] as SocketWithAuth;
            if (!socket.user) {
                throw new PermissionError("未通过身份验证");
            }

            if (!checkPermission(socket.user.role, operation)) {
                throw new PermissionError("权限不足");
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

/**
 * 角色和操作权限双重验证装饰器
 * @param roles 需要的角色
 * @param operation 需要的操作权限
 */
export function RequireRoleAndPermission(
    roles: UserRole | UserRole[],
    operation: RoomOperation
) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            const socket = args[0] as SocketWithAuth;
            if (!socket.user) {
                throw new PermissionError("未通过身份验证");
            }

            const requiredRoles = Array.isArray(roles) ? roles : [roles];
            if (!requiredRoles.includes(socket.user.role)) {
                throw new PermissionError("权限不足");
            }

            if (!checkPermission(socket.user.role, operation)) {
                throw new PermissionError("权限不足");
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export default authMiddleware;