import express, { Request, Response, Router } from "express";
import { resSuccess, resError, resNotFound, resBadRequest } from "../../utils/res";
import { ContestService, ContestRankingService } from "@/models/contest";
import authMiddleware from "@/middlewares/auth";
import { Admin } from "@/middlewares/role";

// 扩展 Express Request 接口，添加 user 属性
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const router: Router = express.Router();

/**
 * @module 竞赛管理路由
 * @description 竞赛管理相关接口
 */

/**
 * 创建竞赛
 * @method POST
 * @route /admin/contest
 * @returns 竞赛创建结果
 */
router.post("/", authMiddleware, Admin, async (req: Request, res: Response) => {
    try {
        const contestData = req.body;
        const newContest = await ContestService.createContest(contestData);
        
        resSuccess(res, {
            id: newContest.contestId,
            name: newContest.name,
            status: newContest.status
        }, "竞赛创建成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 更新竞赛
 * @method PUT
 * @route /admin/contest
 * @returns 竞赛更新结果
 */
router.put("/", authMiddleware, Admin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const updateData = req.body;
        const updatedContest = await ContestService.updateContest(id, updateData);
        
        if (!updatedContest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, {
            id: updatedContest.contestId,
            name: updatedContest.name,
            status: updatedContest.status
        }, "竞赛更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 记录竞赛结果
 * @method POST
 * @route /admin/contest/result
 * @returns 结果记录结果
 */
router.post("/result", authMiddleware, Admin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const { teamName, date, round, result } = req.body;
        const contest = await ContestService.getContestById(id);
        
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        const recordResult = await ContestRankingService.recordMatchResult(
            contest._id.toString(),
            teamName,
            date,
            round,
            result
        );
        
        resSuccess(res, recordResult.data, recordResult.message);
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 添加竞赛管理员
 * @method POST
 * @route /admin/contest/admins
 * @returns 添加结果
 */
router.post("/admins", authMiddleware, Admin, async (req: Request, res: Response) => {
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
        
        // 这里可以添加添加管理员的逻辑
        resSuccess(res, [], "管理员添加成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 删除竞赛管理员
 * @method DELETE
 * @route /admin/contest/admins/:userId
 * @returns 删除结果
 */
router.delete("/admins/:userId", authMiddleware, Admin, async (req: Request, res: Response) => {
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
        
        // 这里可以添加删除管理员的逻辑
        resSuccess(res, [], "管理员删除成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 更新竞赛管理员权限
 * @method PUT
 * @route /admin/contest/admins/:userId/permissions
 * @returns 更新结果
 */
router.put("/admins/:userId/permissions", authMiddleware, Admin, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const { userId } = req.params;
        const permissions = req.body;
        
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加更新管理员权限的逻辑
        resSuccess(res, { userId, permissions }, "权限更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取竞赛管理员列表
 * @method GET
 * @route /admin/contest/admins
 * @returns 管理员列表
 */
router.get("/admins", authMiddleware, Admin, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取管理员列表的逻辑
        resSuccess(res, [], "获取管理员列表成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

export default router;