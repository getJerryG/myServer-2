import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { PermissionError } from "../utils/errors";
import { UserRole, RoomOperation, RoomPermissions } from "../types/room";

/**
 * Socket.io 扩展接口，包含用户信息
 */
interface SocketWithAuth extends Socket {
    user?: { 
        id: number; 
        username: string; 
        role: UserRole 
    };
}

/**
 * Socket.io JWT 身份验证中间件
 */
export const socketAuthMiddleware = async (
    socket: SocketWithAuth,
    next: (err?: ExtendedError) => void
) => {
    try {
        // 从连接查询参数中获取token
        const {token} = socket.handshake.auth;
        if (!token) {
            throw new PermissionError("缺少身份验证令牌");
        }
        
        const decoded = await verifyToken(token);
        
        // 设置socket用户信息
        socket.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        next(new PermissionError("身份验证失败"));
    }
};

/**
 * HTTP 请求 JWT 身份验证中间件
 */
export const httpAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 从请求头获取token
        const token = extractTokenFromHeader(req);
        if (!token) {
            throw new PermissionError("缺少身份验证令牌");
        }
        
        const decoded = await verifyToken(token);
        
        // 设置请求用户信息
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };
        
        next();
    } catch (error) {
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
    return function(
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: unknown[]) {
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
    return function(
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: unknown[]) {
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
    return function(
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: unknown[]) {
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