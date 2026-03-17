import PermissionModel from "../models/PermissionModel";
import { IPermission } from "../types/permission-types";
import { PERMISSIONS } from "../constants/permissionConstants";

export default class PermissionService {
    static async createPermission(data: Omit<IPermission, "_id" | "createdAt" | "updatedAt">) {
        try {
            return await PermissionModel.createPermission(data);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("E11000 duplicate key error")) {
                    throw new Error("权限代码已存在");
                }
                throw error;
            }
            throw new Error("创建权限失败");
        }
    }

    static async getPermissionByCode(code: string) {
        const permission = await PermissionModel.findByCode(code);
        if (!permission) {
            throw new Error("权限不存在");
        }
        return permission;
    }

    static async getPermissionsByResource(resource: string) {
        return await PermissionModel.findByResource(resource);
    }

    static async getPermissionsByModule(module: string) {
        return await PermissionModel.findByModule(module);
    }

    static async getAllPermissions() {
        return await PermissionModel.findAllPermissions();
    }

    static async updatePermission(code: string, updateData: Partial<Omit<IPermission, "_id" | "createdAt" | "updatedAt">>) {
        const permission = await PermissionModel.updatePermission(code, updateData);
        if (!permission) {
            throw new Error("权限不存在或更新失败");
        }
        return permission;
    }

    static async deletePermission(code: string) {
        const result = await PermissionModel.deletePermission(code);
        if (!result) {
            throw new Error("权限不存在或删除失败");
        }
        return true;
    }

    static async batchCreatePermissions(permissions: Omit<IPermission, "_id" | "createdAt" | "updatedAt">[]) {
        try {
            return await PermissionModel.batchCreatePermissions(permissions);
        } catch (error) {
            throw new Error(`批量创建权限失败: ${(error as Error).message}`);
        }
    }

    static async checkPermissionExists(code: string): Promise<boolean> {
        try {
            await this.getPermissionByCode(code);
            return true;
        } catch {
            return false;
        }
    }

    static async getPermissionsByCodes(codes: string[]): Promise<IPermission[]> {
        const permissions = await PermissionModel.findAllPermissions();
        return permissions.filter(p => codes.includes(p.code));
    }

    /**
     * 获取默认权限列表
     */
    private static getDefaultPermissions(): PermissionCreateType[] {
        return [
            {
                code: PERMISSIONS.CONTEST_MANAGE_ADMIN,
                name: "赛事管理-管理员",
                description: "拥有赛事的完整管理权限",
                resource: "contest",
                module: "manage",
                operation: "admin"
            },
            {
                code: PERMISSIONS.CONTEST_AUDIT_PASS,
                name: "赛事审核-通过",
                description: "可以审核通过赛事",
                resource: "contest",
                module: "audit",
                operation: "pass"
            },
            {
                code: PERMISSIONS.CONTEST_AUDIT_REJECT,
                name: "赛事审核-拒绝",
                description: "可以审核拒绝赛事",
                resource: "contest",
                module: "audit",
                operation: "reject"
            },
            {
                code: PERMISSIONS.CONTEST_DATA_SUBMIT,
                name: "赛事数据-提交",
                description: "可以提交赛事数据",
                resource: "contest",
                module: "data",
                operation: "submit"
            },
            {
                code: PERMISSIONS.CONTEST_SCHEDULE_EDIT,
                name: "赛事日程-编辑",
                description: "可以编辑赛事日程",
                resource: "contest",
                module: "schedule",
                operation: "edit"
            },
            {
                code: PERMISSIONS.CONTEST_PARTICIPANT_MANAGE,
                name: "赛事参与者-管理",
                description: "可以管理赛事参与者",
                resource: "contest",
                module: "participant",
                operation: "manage"
            },
            {
                code: PERMISSIONS.CONTEST_RESULT_VIEW,
                name: "赛事结果-查看",
                description: "可以查看赛事结果",
                resource: "contest",
                module: "result",
                operation: "view"
            },
            {
                code: PERMISSIONS.CONTEST_EXPORT,
                name: "赛事数据-导出",
                description: "可以导出赛事数据",
                resource: "contest",
                module: "export",
                operation: "view"
            },
            {
                code: PERMISSIONS.CONTEST_VIEW,
                name: "赛事信息-查看",
                description: "可以查看赛事信息",
                resource: "contest",
                module: "view",
                operation: "view"
            },
            {
                code: PERMISSIONS.USER_MANAGE_ADMIN,
                name: "用户管理-管理员",
                description: "拥有用户管理的完整权限",
                resource: "user",
                module: "manage",
                operation: "admin"
            },
            {
                code: PERMISSIONS.USER_VIEW,
                name: "用户信息-查看",
                description: "可以查看用户信息",
                resource: "user",
                module: "view",
                operation: "view"
            },
            {
                code: PERMISSIONS.USER_EDIT,
                name: "用户信息-编辑",
                description: "可以编辑用户信息",
                resource: "user",
                module: "manage",
                operation: "edit"
            },
            {
                code: PERMISSIONS.CLAN_MANAGE_ADMIN,
                name: "公会管理-管理员",
                description: "拥有公会管理的完整权限",
                resource: "clan",
                module: "manage",
                operation: "admin"
            },
            {
                code: PERMISSIONS.CLAN_MEMBER_MANAGE,
                name: "公会成员-管理",
                description: "可以管理公会成员",
                resource: "clan",
                module: "participant",
                operation: "manage"
            },
            {
                code: PERMISSIONS.ROOM_MANAGE_ADMIN,
                name: "房间管理-管理员",
                description: "拥有房间管理的完整权限",
                resource: "room",
                module: "manage",
                operation: "admin"
            },
            {
                code: PERMISSIONS.ROOM_KICK,
                name: "房间管理-踢人",
                description: "可以将用户踢出房间",
                resource: "room",
                module: "manage",
                operation: "delete"
            },
            {
                code: PERMISSIONS.SYSTEM_MANAGE_ADMIN,
                name: "系统管理-管理员",
                description: "拥有系统管理的完整权限",
                resource: "system",
                module: "manage",
                operation: "admin"
            },
            {
                code: PERMISSIONS.SYSTEM_CONFIG,
                name: "系统配置-编辑",
                description: "可以编辑系统配置",
                resource: "system",
                module: "manage",
                operation: "edit"
            }
        ];
    }

    static async initializeDefaultPermissions() {
        const defaultPermissions = this.getDefaultPermissions();

        const existingCodes = await this.getPermissionsByCodes(
            defaultPermissions.map(p => p.code)
        );

        if (existingCodes.length === 0) {
            await this.batchCreatePermissions(defaultPermissions);
            console.log(`[PermissionService] 初始化了 ${defaultPermissions.length} 个默认权限`);
        } else {
            console.log("[PermissionService] 默认权限已存在，跳过初始化");
        }

        return defaultPermissions;
    }
}
