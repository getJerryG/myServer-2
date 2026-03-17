import { ObjectId } from "mongoose";
import { PermissionString, DataScope } from "@/models/permission/types/permission-types";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";
import UserRoleService from "@/models/permission/services/UserRoleService";
import ContestUserPermissionModel from "@/models/contest/models/ContestUserPermissionModel";

export interface DataPermissionCheck {
    userId: ObjectId;
    resourceType: string;
    resourceId: ObjectId;
    requiredPermission: PermissionString;
    dataScope?: DataScope;
}

export async function checkPermission(userId: string, requiredPermission: PermissionString): Promise<boolean> {
    const userPermissions = await PermissionCacheService.getUserPermissions(userId);

    if (!userPermissions) {
        const permissions = await UserRoleService.getUserPermissions(userId);
        const roles = await UserRoleService.getUserRoleCodes(userId);
        await PermissionCacheService.setUserPermissions(userId, permissions, roles);
        return permissions.includes(requiredPermission);
    }

    return userPermissions.permissions.includes(requiredPermission);
}

export async function checkAnyPermission(userId: string, requiredPermissions: PermissionString[]): Promise<boolean> {
    const userPermissions = await PermissionCacheService.getUserPermissions(userId);

    if (!userPermissions) {
        const permissions = await UserRoleService.getUserPermissions(userId);
        const roles = await UserRoleService.getUserRoleCodes(userId);
        await PermissionCacheService.setUserPermissions(userId, permissions, roles);
        return requiredPermissions.some(p => permissions.includes(p));
    }

    return requiredPermissions.some(p => userPermissions.permissions.includes(p));
}

export async function checkRole(userId: string, requiredRoleCode: string): Promise<boolean> {
    return await UserRoleService.hasRole(userId, requiredRoleCode);
}

export async function checkAnyRole(userId: string, requiredRoleCodes: string[]): Promise<boolean> {
    const userRoles = await UserRoleService.getUserRoles(userId);
    const userRoleCodes = userRoles.map(ur => ur.roleId.toString());
    return requiredRoleCodes.some(code => userRoleCodes.includes(code));
}

/**
 * 加载用户权限，如果不存在则从数据库获取并缓存
 */
async function loadUserPermissions(userId: string) {
    const userPermissions = await PermissionCacheService.getUserPermissions(userId);
    if (!userPermissions) {
        const permissions = await UserRoleService.getUserPermissions(userId);
        const roles = await UserRoleService.getUserRoleCodes(userId);
        await PermissionCacheService.setUserPermissions(userId, permissions, roles);
        return null;
    }
    return userPermissions;
}

/**
 * 获取竞赛用户权限
 */
async function getContestPermission(userId: ObjectId, resourceId: ObjectId) {
    return await ContestUserPermissionModel.findByUserIdAndContestId(
        userId,
        resourceId
    );
}

/**
 * 根据数据范围检查访问权限
 */
function checkDataScopeAccess(
    userId: ObjectId,
    contestPermission: { dataScope?: DataScope; user_id: ObjectId },
    resourceId: ObjectId
) {
    const scope = contestPermission.dataScope || { type: "own" };
    
    switch (scope.type) {
    case "all":
        return true;
    case "own":
        return userId.toString() === contestPermission.user_id.toString();
    case "team":
        return scope.customIds?.includes(resourceId);
    case "custom":
        return scope.customIds?.includes(resourceId);
    default:
        return false;
    }
}

export async function checkDataPermission(check: DataPermissionCheck): Promise<boolean> {
    const userIdStr = check.userId.toString();
    const userPermissions = await loadUserPermissions(userIdStr);
    
    if (!userPermissions) {
        return false;
    }
    
    const hasPermission = userPermissions.permissions.includes(check.requiredPermission);
    if (!hasPermission) {
        return false;
    }
    
    const contestPermission = await getContestPermission(check.userId, check.resourceId);
    if (!contestPermission) {
        return false;
    }
    
    return checkDataScopeAccess(check.userId, contestPermission, check.resourceId);
}

export async function getUserPermissions(userId: string): Promise<PermissionString[]> {
    const cached = await PermissionCacheService.getUserPermissions(userId);

    if (cached) {
        return cached.permissions;
    }

    const permissions = await UserRoleService.getUserPermissions(userId);
    const roles = await UserRoleService.getUserRoleCodes(userId);
    await PermissionCacheService.setUserPermissions(userId, permissions, roles);

    return permissions;
}

export async function getUserRoles(userId: string): Promise<string[]> {
    const cached = await PermissionCacheService.getUserPermissions(userId);

    if (cached) {
        return cached.roles;
    }

    const userRoles = await UserRoleService.getUserRoles(userId);
    return userRoles.map(ur => ur.roleId.toString());
}

export async function invalidateUserPermissions(userId: string): Promise<void> {
    await PermissionCacheService.invalidateUserCache(userId);
}

export async function refreshUserPermissions(userId: string): Promise<void> {
    await PermissionCacheService.refreshUserPermissions(userId);
}

export function parsePermissionString(permissionString: string): {
    resource: string;
    module: string;
    operation: string;
} | null {
    const parts = permissionString.split(":");
    if (parts.length !== 3) {
        return null;
    }

    const [resource, module, operation] = parts;
    return { resource, module, operation };
}

export function buildPermissionString(resource: string, module: string, operation: string): string {
    return `${resource}:${module}:${operation}`;
}

export async function warmupUserPermissions(userId: string): Promise<void> {
    await PermissionCacheService.warmupUserPermissions(userId);
}

export async function batchWarmupUserPermissions(userIds: string[]): Promise<void> {
    await PermissionCacheService.batchWarmupUserPermissions(userIds);
}
