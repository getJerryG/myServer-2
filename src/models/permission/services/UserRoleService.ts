import UserRoleModel from "../models/UserRoleModel";
import RoleModel from "../models/RoleModel";
import type { IUserRole, PermissionString } from "../types/permission-types";

export default class UserRoleService {
    static async createUserRole(data: Omit<IUserRole, "_id" | "createdAt" | "updatedAt">) {
        try {
            return await UserRoleModel.createUserRole(data);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("E11000 duplicate key error")) {
                    throw new Error("该用户已拥有此角色");
                }
                throw error;
            }
            throw new Error("创建用户角色关联失败");
        }
    }

    static async getUserRoles(userId: string) {
        return await UserRoleModel.findByUserId(userId);
    }

    static async getRoleUsers(roleId: string) {
        return await UserRoleModel.findByRoleId(roleId);
    }

    static async getUserRole(userId: string, roleId: string) {
        const userRole = await UserRoleModel.findByUserAndRole(userId, roleId);
        if (!userRole) {
            throw new Error("用户角色关联不存在");
        }
        return userRole;
    }

    static async updateUserRole(userId: string, roleId: string, updateData: Partial<Omit<IUserRole, "_id" | "createdAt" | "updatedAt">>) {
        const userRole = await UserRoleModel.updateUserRole(userId, roleId, updateData);
        if (!userRole) {
            throw new Error("用户角色关联不存在或更新失败");
        }
        return userRole;
    }

    static async deleteUserRole(userId: string, roleId: string) {
        const result = await UserRoleModel.deleteUserRole(userId, roleId);
        if (!result) {
            throw new Error("用户角色关联不存在或删除失败");
        }
        return true;
    }

    static async deleteAllUserRoles(userId: string) {
        const result = await UserRoleModel.deleteAllUserRoles(userId);
        return result.deletedCount > 0;
    }

    static async assignRolesToUser(userId: string, roleIds: string[], assignedBy: string) {
        try {
            const userRoles = await UserRoleModel.assignRolesToUser(userId, roleIds, assignedBy);
            console.log(`[UserRoleService] 为用户 ${userId} 分配了 ${roleIds.length} 个角色`);
            return userRoles;
        } catch (error) {
            throw new Error(`分配角色失败: ${(error as Error).message}`);
        }
    }

    static async revokeRoleFromUser(userId: string, roleId: string) {
        try {
            const result = await UserRoleModel.revokeRoleFromUser(userId, roleId);
            if (result) {
                console.log(`[UserRoleService] 已从用户 ${userId} 撤销角色 ${roleId}`);
            }
            return true;
        } catch (error) {
            throw new Error(`撤销角色失败: ${(error as Error).message}`);
        }
    }

    static async assignSystemAdminRole(userId: string, assignedBy: string) {
        const systemAdminRole = await RoleModel.getRoleByCode("system_admin");
        if (!systemAdminRole) {
            throw new Error("系统管理员角色不存在");
        }
        return await this.assignRolesToUser(userId, [systemAdminRole._id.toString()], assignedBy);
    }

    static async assignContestAdminRole(userId: string, assignedBy: string) {
        const contestAdminRole = await RoleModel.getRoleByCode("contest_admin");
        if (!contestAdminRole) {
            throw new Error("赛事管理员角色不存在");
        }
        return await this.assignRolesToUser(userId, [contestAdminRole._id.toString()], assignedBy);
    }

    static async assignContestViewerRole(userId: string, assignedBy: string) {
        const contestViewerRole = await RoleModel.getRoleByCode("contest_viewer");
        if (!contestViewerRole) {
            throw new Error("赛事查看者角色不存在");
        }
        return await this.assignRolesToUser(userId, [contestViewerRole._id.toString()], assignedBy);
    }

    static async getUserPermissions(userId: string): Promise<PermissionString[]> {
        const userRoles = await this.getUserRoles(userId);
        const permissions: PermissionString[] = [];

        for (const userRole of userRoles) {
            const role = await RoleModel.getRoleByCode(userRole.roleId.toString());
            if (role) {
                permissions.push(...role.permissions);
            }
        }

        return [...new Set(permissions)];
    }

    static async getUserRoleCodes(userId: string): Promise<string[]> {
        const userRoles = await this.getUserRoles(userId);
        return userRoles.map(ur => ur.roleId.toString());
    }

    static async hasRole(userId: string, roleCode: string): Promise<boolean> {
        const userRoles = await this.getUserRoles(userId);
        return userRoles.some(ur => ur.roleId.toString() === roleCode);
    }

    static async assignTemporaryRole(userId: string, roleId: string, assignedBy: string, _expiresAt: Date) {
        return await this.assignRolesToUser(userId, [roleId], assignedBy);
    }
}
