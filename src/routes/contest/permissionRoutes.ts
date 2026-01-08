import express, { Request, Response, Router } from "express";
import ContestUserPermissionService from "@/models/contest/services/ContestUserPermissionService";
import authMiddleware from "@/middlewares/auth";
import { resSuccess, resError, resBadRequest, resNotFound } from "../../utils/res";

const router: Router = express.Router();

/**
 * @module 用户-赛事权限路由
 * @description 用户-赛事权限关联管理接口
 */

/**
 * 创建权限关联
 * @method POST
 * @route /contest/permission
 * @returns 创建的权限关联
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { user_id, contest_id, role, permissions } = req.body;
        
        if (!user_id || !contest_id) {
            return resBadRequest(res, "缺少用户ID或赛事ID");
        }
        
        const result = await ContestUserPermissionService.createPermission({ user_id, contest_id, role, permissions });
        resSuccess(res, result, "创建权限关联成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 查询用户的赛事权限
 * @method GET
 * @route /contest/permission/user/:userId
 * @returns 权限关联列表
 */
router.get("/user/:userId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return resBadRequest(res, "缺少用户ID");
        }
        
        const permissions = await ContestUserPermissionService.getPermissionsByUserId(userId);
        resSuccess(res, permissions, "查询用户的赛事权限成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 查询赛事的用户权限
 * @method GET
 * @route /contest/permission/contest/:contestId
 * @returns 权限关联列表
 */
router.get("/contest/:contestId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { contestId } = req.params;
        
        if (!contestId) {
            return resBadRequest(res, "缺少赛事ID");
        }
        
        const permissions = await ContestUserPermissionService.getPermissionsByContestId(contestId);
        resSuccess(res, permissions, "查询赛事的用户权限成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 查询特定的权限关联
 * @method GET
 * @route /contest/permission
 * @returns 权限关联或null
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId, contestId } = req.query;
        
        if (!userId || !contestId) {
            return resBadRequest(res, "缺少用户ID或赛事ID");
        }
        
        const permission = await ContestUserPermissionService.getPermissionByUserAndContest(userId, contestId);
        if (!permission) {
            return resNotFound(res, "权限关联不存在");
        }
        
        resSuccess(res, permission, "查询权限关联成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 更新权限信息
 * @method PUT
 * @route /contest/permission
 * @returns 更新后的权限关联
 */
router.put("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId, contestId, role, permissions } = req.body;
        
        if (!userId || !contestId) {
            return resBadRequest(res, "缺少用户ID或赛事ID");
        }
        
        const result = await ContestUserPermissionService.updatePermission(userId, contestId, { role, permissions });
        if (!result) {
            return resNotFound(res, "权限关联不存在");
        }
        
        resSuccess(res, result, "更新权限关联成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 删除权限关联
 * @method DELETE
 * @route /contest/permission
 * @returns 删除结果
 */
router.delete("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId, contestId } = req.query;
        
        if (!userId || !contestId) {
            return resBadRequest(res, "缺少用户ID或赛事ID");
        }
        
        const result = await ContestUserPermissionService.deletePermission(userId, contestId);
        if (!result) {
            return resNotFound(res, "权限关联不存在");
        }
        
        resSuccess(res, { deleted: result }, "删除权限关联成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 批量创建或更新权限关联
 * @method POST
 * @route /contest/permission/batch
 * @returns 操作结果
 */
router.post("/batch", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { permissions } = req.body;
        
        if (!permissions || !Array.isArray(permissions)) {
            return resBadRequest(res, "缺少有效的权限关联数组");
        }
        
        const result = await ContestUserPermissionService.batchUpsertPermissions(permissions);
        resSuccess(res, result, "批量操作权限关联成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

export default router;
