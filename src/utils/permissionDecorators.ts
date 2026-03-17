import { PermissionString } from "@/models/permission/types/permission-types";
import { checkPermission, checkAnyPermission } from "@/utils/permissionUtils";
import { PermissionError } from "@/utils/errors";

interface RequestWithAuth {
    user: {
        id: string;
        userId: string;
    };
}

export function RequirePermission(permission: PermissionString) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as RequestWithAuth;
            const {userId} = req.user;

            if (!userId) {
                throw new PermissionError("用户未认证");
            }

            const hasPermission = await checkPermission(userId, permission);
            if (!hasPermission) {
                throw new PermissionError(`缺少权限: ${permission}`);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export function RequireAnyPermission(permissions: PermissionString[]) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as RequestWithAuth;
            const {userId} = req.user;

            if (!userId) {
                throw new PermissionError("用户未认证");
            }

            const hasPermission = await checkAnyPermission(userId, permissions);
            if (!hasPermission) {
                throw new PermissionError(`缺少任一权限: ${permissions.join(" 或 ")}`);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export function RequireRole(roleCode: string) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as RequestWithAuth;
            const {userId} = req.user;

            if (!userId) {
                throw new PermissionError("用户未认证");
            }

            const { checkRole } = await import("@/utils/permissionUtils");
            const hasRole = await checkRole(userId, roleCode);
            if (!hasRole) {
                throw new PermissionError(`缺少角色: ${roleCode}`);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export function RequireAnyRole(roleCodes: string[]) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as RequestWithAuth;
            const {userId} = req.user;

            if (!userId) {
                throw new PermissionError("用户未认证");
            }

            const { checkAnyRole } = await import("@/utils/permissionUtils");
            const hasRole = await checkAnyRole(userId, roleCodes);
            if (!hasRole) {
                throw new PermissionError(`缺少任一角色: ${roleCodes.join(" 或 ")}`);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

export function RequirePermissionOrRole(requiredPermission: PermissionString, roleCode: string) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const req = args[0] as RequestWithAuth;
            const {userId} = req.user;

            if (!userId) {
                throw new PermissionError("用户未认证");
            }

            const { checkPermission, checkRole } = await import("@/utils/permissionUtils");
            const hasPermission = await checkPermission(userId, requiredPermission);
            const hasRole = await checkRole(userId, roleCode);

            if (!hasPermission && !hasRole) {
                throw new PermissionError(`需要权限 ${requiredPermission} 或角色 ${roleCode}`);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
