import { ObjectId } from "mongoose";
import ContestUserPermissionModel from "../models/ContestUserPermissionModel";
import { IContestUserPermission } from "../types/contest-user-permission-types";

/**
 * 用户-赛事权限关联服务类
 * 提供用户-赛事权限关联的CRUD操作
 */
export default class ContestUserPermissionService {
    /**
     * 创建用户-赛事权限关联
     * @param data 权限关联数据
     * @returns 创建的权限关联
     */
    static async createPermission(data: Partial<IContestUserPermission>) {
        try {
            return await ContestUserPermissionModel.createPermission(data);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("E11000 duplicate key error")) {
                    throw new Error("该用户与赛事的权限关联已存在");
                }
                throw error;
            }
            throw new Error("创建权限关联失败");
        }
    }

    /**
     * 根据用户ID查询赛事权限
     * @param userId 用户ID
     * @returns 权限关联列表
     */
    static async getPermissionsByUserId(userId: ObjectId) {
        return await ContestUserPermissionModel.findByUserId(userId);
    }

    /**
     * 根据赛事ID查询用户权限
     * @param contestId 赛事ID
     * @returns 权限关联列表
     */
    static async getPermissionsByContestId(contestId: ObjectId) {
        return await ContestUserPermissionModel.findByContestId(contestId);
    }

    /**
     * 根据用户ID和赛事ID查询特定权限
     * @param userId 用户ID
     * @param contestId 赛事ID
     * @returns 权限关联或null
     */
    static async getPermissionByUserAndContest(userId: ObjectId, contestId: ObjectId) {
        return await ContestUserPermissionModel.findByUserIdAndContestId(userId, contestId);
    }

    /**
     * 更新用户-赛事权限关联
     * @param userId 用户ID
     * @param contestId 赛事ID
     * @param data 更新数据
     * @returns 更新后的权限关联或null
     */
    static async updatePermission(userId: ObjectId, contestId: ObjectId, data: Partial<IContestUserPermission>) {
        return await ContestUserPermissionModel.updatePermission(userId, contestId, data);
    }

    /**
     * 删除用户-赛事权限关联
     * @param userId 用户ID
     * @param contestId 赛事ID
     * @returns 是否删除成功
     */
    static async deletePermission(userId: ObjectId, contestId: ObjectId) {
        const result = await ContestUserPermissionModel.deletePermission(userId, contestId);
        return result !== null;
    }

    /**
     * 批量创建或更新用户-赛事权限关联
     * @param permissions 权限关联数组
     * @returns 操作结果
     */
    static async batchUpsertPermissions(permissions: Partial<IContestUserPermission>[]) {
        const results = [];
        for (const permission of permissions) {
            if (!permission.user_id || !permission.contest_id) {
                throw new Error("用户ID和赛事ID不能为空");
            }
            
            const existing = await ContestUserPermissionModel.findByUserIdAndContestId(
                permission.user_id as ObjectId,
                permission.contest_id as ObjectId
            );
            
            if (existing) {
                results.push(await this.updatePermission(
                    permission.user_id as ObjectId,
                    permission.contest_id as ObjectId,
                    permission
                ));
            } else {
                results.push(await this.createPermission(permission));
            }
        }
        return results;
    }
}
