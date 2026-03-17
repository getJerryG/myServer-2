import RoleModel from "../models/RoleModel";
import { IRole, PermissionString } from "../types/permission-types";
import { DEFAULT_ROLES } from "../constants/permissionConstants";

export default class RoleService {
    static async createRole(data: Omit<IRole, "_id" | "createdAt" | "updatedAt">) {
        try {
            return await RoleModel.createRole(data);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("E11000 duplicate key error")) {
                    throw new Error("角色代码已存在");
                }
                throw error;
            }
            throw new Error("创建角色失败");
        }
    }

    static async getRoleByCode(code: string) {
        const role = await RoleModel.findByCode(code);
        if (!role) {
            throw new Error("角色不存在");
        }
        return role;
    }

    static async getAllRoles() {
        return await RoleModel.findAllRoles();
    }

    static async getSystemRoles() {
        return await RoleModel.findSystemRoles();
    }

    static async getCustomRoles() {
        return await RoleModel.findCustomRoles();
    }

    static async updateRole(code: string, updateData: Partial<Omit<IRole, "_id" | "createdAt" | "updatedAt">>) {
        const role = await RoleModel.updateRole(code, updateData);
        if (!role) {
            throw new Error("角色不存在或更新失败");
        }
        return role;
    }

    static async deleteRole(code: string) {
        const result = await RoleModel.deleteRole(code);
        if (!result) {
            throw new Error("角色不存在或删除失败");
        }
        return true;
    }

    static async addPermissionsToRole(code: string, permissions: PermissionString[]) {
        const role = await RoleModel.addPermissionsToRole(code, permissions);
        if (!role) {
            throw new Error("角色不存在或添加权限失败");
        }
        return role;
    }

    static async removePermissionsFromRole(code: string, permissions: PermissionString[]) {
        const role = await RoleModel.removePermissionsFromRole(code, permissions);
        if (!role) {
            throw new Error("角色不存在或移除权限失败");
        }
        return role;
    }

    static async initializeDefaultRoles() {
        const defaultRoles = Object.values(DEFAULT_ROLES);

        for (const defaultRole of defaultRoles) {
            try {
                await this.createRole(defaultRole);
                console.log(`[RoleService] 创建默认角色: ${defaultRole.name}`);
            } catch (error) {
                if (error instanceof Error && !error.message.includes("E11000 duplicate key error")) {
                    console.log(`[RoleService] 默认角色已存在: ${defaultRole.name}`);
                }
            }
        }

        console.log("[RoleService] 默认角色初始化完成");
    }

    static async getRolePermissions(code: string): Promise<PermissionString[]> {
        const role = await this.getRoleByCode(code);
        return role.permissions;
    }

    static async batchUpdateRoles(roles: Array<{ code: string; permissions: PermissionString[] }>) {
        const results = [];
        for (const role of roles) {
            try {
                const updated = await this.updateRole(role.code, { permissions: role.permissions });
                results.push(updated);
            } catch (error) {
                console.error(`[RoleService] 更新角色失败: ${role.code}`, error);
            }
        }
        return results;
    }
}
