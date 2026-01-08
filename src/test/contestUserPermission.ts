// 测试用户-赛事权限关联
import ContestUserPermissionService from "../models/contest/services/ContestUserPermissionService";
import { IContestUserPermission } from "../models/contest/types/contest-user-permission-types";
import mongoose from "mongoose";

/**
 * 主测试函数，按顺序执行所有测试步骤
 */
async function runTest(): Promise<void> {
    try {
        console.log("开始测试用户-赛事权限关联...");
        
        // 创建测试数据
        const testUserId = new mongoose.Types.ObjectId();
        const testContestId = new mongoose.Types.ObjectId();
        const testUserId2 = new mongoose.Types.ObjectId();
        
        console.log("\n1. 创建权限关联测试：");
        const createdPermission = await createPermission(testUserId, testContestId);
        if (!createdPermission) return;
        
        console.log("\n2. 查询用户的赛事权限测试：");
        await getPermissionsByUserId(testUserId);
        
        console.log("\n3. 查询赛事的用户权限测试：");
        await getPermissionsByContestId(testContestId);
        
        console.log("\n4. 查询特定的权限关联测试：");
        await getPermissionByUserAndContest(testUserId, testContestId);
        
        console.log("\n5. 更新权限信息测试：");
        await updatePermission(testUserId, testContestId);
        
        console.log("\n6. 批量创建或更新权限关联测试：");
        await batchUpsertPermissions(testContestId, testUserId2);
        
        console.log("\n7. 删除权限关联测试：");
        await deletePermission(testUserId, testContestId);
        
        console.log("\n测试完成！");
        
    } catch (error) {
        console.error("测试过程中发生错误:", error);
    }
}

/**
 * 创建权限关联
 * @param userId 用户ID
 * @param contestId 赛事ID
 * @returns 创建的权限关联
 */
async function createPermission(userId: mongoose.Types.ObjectId, contestId: mongoose.Types.ObjectId): Promise<IContestUserPermission | null> {
    try {
        const permissionData = {
            user_id: userId,
            contest_id: contestId,
            role: "admin",
            permissions: {
                view: true,
                edit: true,
                submitData: true,
                manageAdmins: true,
                manageParticipants: true,
                manageSchedule: true,
                viewResults: true,
                exportData: true
            }
        };
        
        const result = await ContestUserPermissionService.createPermission(permissionData);
        console.log("创建权限关联成功:", result);
        return result;
    } catch (error) {
        console.error("创建权限关联失败:", error);
        return null;
    }
}

/**
 * 查询用户的赛事权限
 * @param userId 用户ID
 */
async function getPermissionsByUserId(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
        const result = await ContestUserPermissionService.getPermissionsByUserId(userId);
        console.log(`用户 ${userId} 的赛事权限列表:`, result);
    } catch (error) {
        console.error("查询用户的赛事权限失败:", error);
    }
}

/**
 * 查询赛事的用户权限
 * @param contestId 赛事ID
 */
async function getPermissionsByContestId(contestId: mongoose.Types.ObjectId): Promise<void> {
    try {
        const result = await ContestUserPermissionService.getPermissionsByContestId(contestId);
        console.log(`赛事 ${contestId} 的用户权限列表:`, result);
    } catch (error) {
        console.error("查询赛事的用户权限失败:", error);
    }
}

/**
 * 查询特定的权限关联
 * @param userId 用户ID
 * @param contestId 赛事ID
 */
async function getPermissionByUserAndContest(userId: mongoose.Types.ObjectId, contestId: mongoose.Types.ObjectId): Promise<void> {
    try {
        const result = await ContestUserPermissionService.getPermissionByUserAndContest(userId, contestId);
        console.log(`用户 ${userId} 在赛事 ${contestId} 的权限:`, result);
    } catch (error) {
        console.error("查询特定的权限关联失败:", error);
    }
}

/**
 * 更新权限信息
 * @param userId 用户ID
 * @param contestId 赛事ID
 */
async function updatePermission(userId: mongoose.Types.ObjectId, contestId: mongoose.Types.ObjectId): Promise<void> {
    try {
        const updateData = {
            role: "participant",
            permissions: {
                view: true,
                edit: false,
                submitData: true,
                manageAdmins: false,
                manageParticipants: false,
                manageSchedule: false,
                viewResults: true,
                exportData: false
            }
        };
        
        const result = await ContestUserPermissionService.updatePermission(userId, contestId, updateData);
        console.log("更新权限信息成功:", result);
    } catch (error) {
        console.error("更新权限信息失败:", error);
    }
}

/**
 * 批量创建或更新权限关联
 * @param contestId 赛事ID
 * @param userId2 第二个测试用户ID
 */
async function batchUpsertPermissions(contestId: mongoose.Types.ObjectId, userId2: mongoose.Types.ObjectId): Promise<void> {
    try {
        const permissions = [
            {
                user_id: userId2,
                contest_id: contestId,
                role: "viewer",
                permissions: {
                    view: true,
                    edit: false,
                    submitData: false,
                    manageAdmins: false,
                    manageParticipants: false,
                    manageSchedule: false,
                    viewResults: true,
                    exportData: false
                }
            },
            {
                user_id: new mongoose.Types.ObjectId(),
                contest_id: contestId,
                role: "participant",
                permissions: {
                    view: true,
                    edit: false,
                    submitData: true,
                    manageAdmins: false,
                    manageParticipants: false,
                    manageSchedule: false,
                    viewResults: true,
                    exportData: false
                }
            }
        ];
        
        const result = await ContestUserPermissionService.batchUpsertPermissions(permissions);
        console.log("批量创建或更新权限关联成功:", result);
    } catch (error) {
        console.error("批量创建或更新权限关联失败:", error);
    }
}

/**
 * 删除权限关联
 * @param userId 用户ID
 * @param contestId 赛事ID
 */
async function deletePermission(userId: mongoose.Types.ObjectId, contestId: mongoose.Types.ObjectId): Promise<void> {
    try {
        const result = await ContestUserPermissionService.deletePermission(userId, contestId);
        console.log("删除权限关联成功:", result);
    } catch (error) {
        console.error("删除权限关联失败:", error);
    }
}

// 执行测试
runTest();
