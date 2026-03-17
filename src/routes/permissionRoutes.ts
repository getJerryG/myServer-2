import express, { Request, Response, Router } from "express";
import PermissionService from "@/models/permission/services/PermissionService";
import RoleService from "@/models/permission/services/RoleService";
import UserRoleService from "@/models/permission/services/UserRoleService";
import PermissionCacheService from "@/models/permission/services/PermissionCacheService";
import authMiddleware from "@/middlewares/auth";
import { resSuccess, resError, resBadRequest, resNotFound } from "@/utils/res";


const router: Router = express.Router();

router.use(authMiddleware);

router.post("/permissions/init", async (req: Request, res: Response) => {
    try {
        await PermissionService.initializeDefaultPermissions();
        await RoleService.initializeDefaultRoles();
        resSuccess(res, null, "权限系统初始化成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/permissions", async (req: Request, res: Response) => {
    try {
        const permissions = await PermissionService.getAllPermissions();
        resSuccess(res, permissions, "获取权限列表成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/permissions/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const permission = await PermissionService.getPermissionByCode(code);
        resSuccess(res, permission, "获取权限详情成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/permissions", async (req: Request, res: Response) => {
    try {
        const { code, name, description, resource, module, operation } = req.body;

        if (!code || !name || !description || !resource || !module || !operation) {
            return resBadRequest(res, "缺少必填字段");
        }

        const permission = await PermissionService.createPermission({
            code,
            name,
            description,
            resource,
            module,
            operation
        });

        resSuccess(res, permission, "创建权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.put("/permissions/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        const permission = await PermissionService.updatePermission(code, { name, description });
        if (!permission) {
            return resNotFound(res, "权限不存在");
        }

        resSuccess(res, permission, "更新权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.delete("/permissions/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        await PermissionService.deletePermission(code);
        resSuccess(res, null, "删除权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/roles", async (req: Request, res: Response) => {
    try {
        const roles = await RoleService.getAllRoles();
        resSuccess(res, roles, "获取角色列表成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/roles/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const role = await RoleService.getRoleByCode(code);
        resSuccess(res, role, "获取角色详情成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/roles", async (req: Request, res: Response) => {
    try {
        const { name, code, description, permissions, isSystem } = req.body;

        if (!name || !code || !description) {
            return resBadRequest(res, "缺少必填字段");
        }

        const role = await RoleService.createRole({
            name,
            code,
            description,
            permissions: permissions || [],
            isSystem: isSystem || false
        });

        resSuccess(res, role, "创建角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.put("/roles/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { name, description, permissions } = req.body;

        const role = await RoleService.updateRole(code, { name, description, permissions });
        if (!role) {
            return resNotFound(res, "角色不存在");
        }

        resSuccess(res, role, "更新角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.delete("/roles/:code", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        await RoleService.deleteRole(code);
        resSuccess(res, null, "删除角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/roles/:code/permissions", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return resBadRequest(res, "permissions必须是数组");
        }

        const role = await RoleService.addPermissionsToRole(code, permissions);
        resSuccess(res, role, "添加权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.delete("/roles/:code/permissions", async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return resBadRequest(res, "permissions必须是数组");
        }

        const role = await RoleService.removePermissionsFromRole(code, permissions);
        resSuccess(res, role, "移除权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/users/:userId/roles", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { roleIds, assignedBy } = req.body;

        if (!roleIds || !Array.isArray(roleIds)) {
            return resBadRequest(res, "缺少角色ID数组");
        }

        await UserRoleService.assignRolesToUser(userId, roleIds, assignedBy);
        resSuccess(res, null, "分配角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.delete("/users/:userId/roles/:roleId", async (req: Request, res: Response) => {
    try {
        const { userId, roleId } = req.params;
        await UserRoleService.deleteUserRole(userId, roleId);
        resSuccess(res, null, "撤销角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.delete("/users/:userId/roles", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        await UserRoleService.deleteAllUserRoles(userId);
        resSuccess(res, null, "清空用户角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/users/:userId/permissions", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const permissions = await UserRoleService.getUserPermissions(userId);
        resSuccess(res, permissions, "获取用户权限成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/users/:userId/roles", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const roles = await UserRoleService.getUserRoles(userId);
        resSuccess(res, roles, "获取用户角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/users/:userId/roles/temporary", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { roleId, expiresAt } = req.body;

        if (!roleId) {
            return resBadRequest(res, "缺少角色ID");
        }

        const expiryDate = expiresAt ? new Date(expiresAt) : undefined;
        await UserRoleService.assignTemporaryRole(userId, roleId, req.user.id, expiryDate);
        resSuccess(res, null, "分配临时角色成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/cache/refresh/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        await PermissionCacheService.refreshUserPermissions(userId);
        resSuccess(res, null, "刷新权限缓存成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/cache/invalidate/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        await PermissionCacheService.invalidateUserPermissions(userId);
        resSuccess(res, null, "失效权限缓存成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.get("/cache/health", async (req: Request, res: Response) => {
    try {
        const health = await PermissionCacheService.checkCacheHealth();
        resSuccess(res, health, "缓存健康检查成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

router.post("/cache/clear", async (req: Request, res: Response) => {
    try {
        await PermissionCacheService.clearAllCache();
        resSuccess(res, null, "清空所有缓存成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

export default router;
