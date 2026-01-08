import { ContestAdmin } from "../types/contest-types";

/**
 * 管理员管理器
 */
export class AdminManager {
    private admins: ContestAdmin[];
    private creatorId: string;

    /**
     * 构造函数
     * @param creatorId 创建者ID
     * @param creatorName 创建者名称
     */
    constructor(creatorId: string, creatorName: string) {
        this.creatorId = creatorId;
        // 初始化管理员列表，创建者为默认管理员
        this.admins = [{
            userId: creatorId,
            username: creatorName,
            role: "creator",
            createdAt: new Date(),
            permissions: {
                view: true,
                edit: true,
                submitData: true,
                manageAdmins: true
            }
        }];
    }

    /**
     * 判断是否为管理员
     * @param userId 用户ID
     * @returns 是否为管理员
     */
    isAdmin(userId: string): boolean {
        return this.admins.some((admin) => admin.userId === userId);
    }

    /**
     * 判断是否有权限
     * @param userId 用户ID
     * @param permission 权限类型
     * @returns 是否有权限
     */
    hasPermission(userId: string, permission: keyof ContestAdmin["permissions"]): boolean {
        const admin = this.admins.find((admin) => admin.userId === userId);
        return admin ? admin.permissions[permission] : false;
    }

    /**
     * 添加管理员
     * @param adminData 管理员数据
     * @param _operator 操作者
     */
    addAdmin(adminData: Omit<ContestAdmin, "createdAt">, _operator: string): void {
        // 检查是否已经是管理员
        if (this.isAdmin(adminData.userId)) {
            throw new Error("该用户已经是管理员");
        }

        // 检查权限
        const newAdmin: ContestAdmin = {
            ...adminData,
            createdAt: new Date()
        };

        this.admins.push(newAdmin);
    }

    /**
     * 移除管理员
     * @param userId 用户ID
     * @param _operator 操作者
     */
    removeAdmin(userId: string, _operator: string): void {
        // 不能移除创建者
        if (userId === this.creatorId) {
            throw new Error("不能移除创建者");
        }

        // 检查是否为管理员
        if (!this.isAdmin(userId)) {
            throw new Error("该用户不是管理员");
        }

        const adminIndex = this.admins.findIndex((admin) => admin.userId === userId);
        if (adminIndex !== -1) {
            this.admins.splice(adminIndex, 1);
        }
    }

    /**
     * 更新管理员权限
     * @param userId 用户ID
     * @param permissions 权限
     * @param _operator 操作者
     */
    updateAdminPermissions(userId: string, permissions: Partial<ContestAdmin["permissions"]>, _operator: string): void {
        const admin = this.admins.find((admin) => admin.userId === userId);
        if (!admin) {
            throw new Error("该用户不是管理员");
        }

        admin.permissions = {
            ...admin.permissions,
            ...permissions
        };
    }

    /**
     * 获取所有管理员
     * @returns 管理员列表
     */
    getAdmins(): ContestAdmin[] {
        return this.admins;
    }
}
