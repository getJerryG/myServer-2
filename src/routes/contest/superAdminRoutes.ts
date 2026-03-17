import express, { Request, Response, Router } from "express";
import { resSuccess, resError, resNotFound, resBadRequest } from "../../utils/res";
import { ContestService } from "@/models/contest";
import authMiddleware from "@/middlewares/auth";
import { SuperAdmin } from "@/middlewares/role";

const router: Router = express.Router();

/**
 * @module 超级管理员竞赛路由
 * @description 超级管理员竞赛相关接口
 */

/**
 * 删除竞赛
 * @method DELETE
 * @route /super-admin/contest
 * @returns 删除结果
 */
router.delete("/", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const deleted = await ContestService.deleteContest(id);
        if (!deleted) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, {}, "竞赛删除成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 更新竞赛状态
 * @method PUT
 * @route /super-admin/contest/status
 * @returns 更新结果
 */
router.put("/status", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const { status } = req.body;
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        const updatedContest = await ContestService.updateContestStatus(id, status);
        if (!updatedContest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, { status: updatedContest.status }, "竞赛状态更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 发布竞赛
 * @method POST
 * @route /super-admin/contest/publish
 * @returns 发布结果
 */
router.post("/publish", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        const updatedContest = await ContestService.updateContestStatus(id, 3); // 假设3是发布状态
        if (!updatedContest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, { status: updatedContest.status }, "竞赛发布成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 手动更新排名
 * @method PUT
 * @route /super-admin/contest/ranking/manual
 * @returns 更新结果
 */
router.put("/ranking/manual", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加手动更新排名的逻辑
        resSuccess(res, {
            ranking: [],
            rankingType: "score",
            rankingUpdatedAt: Date.now()
        }, "排名更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 更新淘汰规则
 * @method PUT
 * @route /super-admin/contest/elimination-rule
 * @returns 更新结果
 */
router.put("/elimination-rule", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const rule = req.body;
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加更新淘汰规则的逻辑
        resSuccess(res, rule, "淘汰规则更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 晋级队伍
 * @method POST
 * @route /super-admin/contest/promote
 * @returns 晋级结果
 */
router.post("/promote", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加晋级队伍的逻辑
        resSuccess(res, {}, "队伍晋级成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 批量更新竞赛状态
 * @method PUT
 * @route /super-admin/contest/batch-update-status
 * @returns 更新结果
 */
router.put("/batch-update-status", authMiddleware, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { contestIds, status } = req.body;
        const result = await ContestService.batchUpdateStatus(contestIds, status);
        
        resSuccess(res, { result }, result ? "批量更新成功" : "批量更新失败");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

export default router;