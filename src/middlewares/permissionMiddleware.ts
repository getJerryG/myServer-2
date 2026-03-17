import { Request, Response, NextFunction } from "express";
import { PermissionString } from "@/models/permission/types/permission-types";
import { ERROR_CODES, ERROR_MESSAGES } from "@/models/permission/constants/permissionConstants";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";
import UserRoleService from "@/models/permission/services/UserRoleService";

interface RequestWithAuth extends Request {
    user: {
        id: string;
        userId: string;
    };
    requiredPermissions?: PermissionString[];
}

export async function requirePermission(requiredPermission: PermissionString) {
    return async (req: RequestWithAuth, res: Response, next: NextFunction) => {
        try {
            const {userId} = req.user;

            if (!userId) {
                return res.status(401).json({
                    errCode: ERROR_CODES.TOKEN_MISSING,
                    message: ERROR_MESSAGES.TOKEN_MISSING
                });
            }

            const userPermissions = await PermissionCacheService.getUserPermissions(userId);

            if (!userPermissions) {
                const permissions = await UserRoleService.getUserPermissions(userId);
                const roles = await UserRoleService.getUserRoleCodes(userId);
                await PermissionCacheService.setUserPermissions(userId, permissions, roles);
            }

            if (!userPermissions.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    errCode: ERROR_CODES.PERMISSION_DENIED,
                    message: `${ERROR_MESSAGES.PERMISSION_DENIED}: ${requiredPermission}`
                });
            }

            next();
        } catch (error) {
            console.error("[PermissionMiddleware] 权限验证错误:", error);
            return res.status(500).json({
                errCode: 500,
                message: "权限验证失败"
            });
        }
    };
}

export async function requireAnyPermission(requiredPermissions: PermissionString[]) {
    return async (req: RequestWithAuth, res: Response, next: NextFunction) => {
        try {
            const {userId} = req.user;

            if (!userId) {
                return res.status(401).json({
                    errCode: ERROR_CODES.TOKEN_MISSING,
                    message: ERROR_MESSAGES.TOKEN_MISSING
                });
            }

            const userPermissions = await PermissionCacheService.getUserPermissions(userId);

            if (!userPermissions) {
                const permissions = await UserRoleService.getUserPermissions(userId);
                const roles = await UserRoleService.getUserRoleCodes(userId);
                await PermissionCacheService.setUserPermissions(userId, permissions, roles);
            }

            const hasPermission = requiredPermissions.some(p => userPermissions.permissions.includes(p));

            if (!hasPermission) {
                return res.status(403).json({
                    errCode: ERROR_CODES.PERMISSION_DENIED,
                    message: `${ERROR_MESSAGES.PERMISSION_DENIED}: ${requiredPermissions.join(" 或 ")}`
                });
            }

            next();
        } catch (error) {
            console.error("[PermissionMiddleware] 权限验证错误:", error);
            return res.status(500).json({
                errCode: 500,
                message: "权限验证失败"
            });
        }
    };
}

export async function requireRole(roleCode: string) {
    return async (req: RequestWithAuth, res: Response, next: NextFunction) => {
        try {
            const {userId} = req.user;

            if (!userId) {
                return res.status(401).json({
                    errCode: ERROR_CODES.TOKEN_MISSING,
                    message: ERROR_MESSAGES.TOKEN_MISSING
                });
            }

            const hasRole = await UserRoleService.hasRole(userId, roleCode);

            if (!hasRole) {
                return res.status(403).json({
                    errCode: ERROR_CODES.PERMISSION_DENIED,
                    message: `${ERROR_MESSAGES.PERMISSION_DENIED}: 角色 ${roleCode}`
                });
            }

            next();
        } catch (error) {
            console.error("[PermissionMiddleware] 角色验证错误:", error);
            return res.status(500).json({
                errCode: 500,
                message: "角色验证失败"
            });
        }
    };
}

export async function requireAnyRole(roleCodes: string[]) {
    return async (req: RequestWithAuth, res: Response, next: NextFunction) => {
        try {
            const {userId} = req.user;

            if (!userId) {
                return res.status(401).json({
                    errCode: ERROR_CODES.TOKEN_MISSING,
                    message: ERROR_MESSAGES.TOKEN_MISSING
                });
            }

            const userRoles = await UserRoleService.getUserRoles(userId);
            const userRoleCodes = userRoles.map(ur => ur.roleId.toString());
            const hasRole = roleCodes.some(code => userRoleCodes.includes(code));

            if (!hasRole) {
                return res.status(403).json({
                    errCode: ERROR_CODES.PERMISSION_DENIED,
                    message: `${ERROR_MESSAGES.PERMISSION_DENIED}: 角色 ${roleCodes.join(" 或 ")}`
                });
            }

            next();
        } catch (error) {
            console.error("[PermissionMiddleware] 角色验证错误:", error);
            return res.status(500).json({
                errCode: 500,
                message: "角色验证失败"
            });
        }
    };
}

export async function requirePermissionOrRole(requiredPermission: PermissionString, roleCode: string) {
    return async (req: RequestWithAuth, res: Response, next: NextFunction) => {
        try {
            const {userId} = req.user;

            if (!userId) {
                return res.status(401).json({
                    errCode: ERROR_CODES.TOKEN_MISSING,
                    message: ERROR_MESSAGES.TOKEN_MISSING
                });
            }

            const userPermissions = await PermissionCacheService.getUserPermissions(userId);

            if (!userPermissions) {
                const permissions = await UserRoleService.getUserPermissions(userId);
                const roles = await UserRoleService.getUserRoleCodes(userId);
                await PermissionCacheService.setUserPermissions(userId, permissions, roles);
            }

            const hasPermission = userPermissions.permissions.includes(requiredPermission);
            const hasRole = await UserRoleService.hasRole(userId, roleCode);

            if (!hasPermission && !hasRole) {
                return res.status(403).json({
                    errCode: ERROR_CODES.PERMISSION_DENIED,
                    message: `${ERROR_MESSAGES.PERMISSION_DENIED}: 需要权限 ${requiredPermission} 或角色 ${roleCode}`
                });
            }

            next();
        } catch (error) {
            console.error("[PermissionMiddleware] 权限或角色验证错误:", error);
            return res.status(500).json({
                errCode: 500,
                message: "权限验证失败"
            });
        }
    };
}
