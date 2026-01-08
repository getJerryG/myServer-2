import express, { Request, Response } from "express";
import ClanService from "../models/clan/services/clanService";
import auth from "@/middlewares/auth";
import { resSuccess, resError, resBadRequest, resNotFound } from "../utils/res";
import { IClanCreate, IClanUpdate, ITransferLeader } from "../models/clan/types/clan";

const router = express.Router();

// ------------------------------ 氏族管理 ------------------------------

/**
 * 创建氏族
 * POST /clan
 */
router.post("/clan", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const clanData = req.body as IClanCreate;
        
        if (!clanData.name) {
            return resBadRequest(res, "缺少氏族名称");
        }
        
        const clan = await ClanService.createClan(userId, clanData);
        resSuccess(res, clan, "创建氏族成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "创建氏族失败");
    }
});

/**
 * 获取氏族详情
 * GET /clan/:clanId
 */
router.get("/clan/:clanId", auth, async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;
        const { withMembers } = req.query;
        
        const clan = await ClanService.getClan(clanId, withMembers === "true");
        if (!clan) {
            return resNotFound(res, "氏族不存在");
        }
        resSuccess(res, clan, "获取氏族详情成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取氏族详情失败");
    }
});

/**
 * 更新氏族信息
 * PUT /clan/:clanId
 */
router.put("/clan/:clanId", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId } = req.params;
        const clanData = req.body as IClanUpdate;
        
        const clan = await ClanService.updateClan(clanId, userId, clanData);
        if (!clan) {
            return resNotFound(res, "氏族不存在");
        }
        resSuccess(res, clan, "更新氏族信息成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "更新氏族信息失败");
    }
});

/**
 * 删除氏族
 * DELETE /clan/:clanId
 */
router.delete("/clan/:clanId", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId } = req.params;
        
        await ClanService.deleteClan(clanId, userId);
        resSuccess(res, null, "删除氏族成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "删除氏族失败");
    }
});

/**
 * 获取氏族列表
 * GET /clans
 */
router.get("/clans", auth, async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10, name = "" } = req.query;
        const query = {
            page: Number(page),
            pageSize: Number(pageSize),
            name: String(name)
        };
        const result = await ClanService.getClanList(query);
        resSuccess(res, result, "获取氏族列表成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取氏族列表失败");
    }
});

/**
 * 获取当前用户所在氏族
 * GET /clan/user/current
 */
router.get("/clan/user/current", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const clan = await ClanService.getUserClan(userId);
        resSuccess(res, clan, "获取用户氏族成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取用户氏族失败");
    }
});

// ------------------------------ 氏族成员管理 ------------------------------

/**
 * 获取氏族成员列表
 * GET /clan/:clanId/members
 */
router.get("/clan/:clanId/members", auth, async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;
        const { page = 1, pageSize = 10, role } = req.query;
        const query = {
            page: Number(page),
            pageSize: Number(pageSize),
            role: role ? String(role) : undefined
        };
        const result = await ClanService.getClanMembers(clanId, query);
        resSuccess(res, result, "获取氏族成员列表成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取氏族成员列表失败");
    }
});

/**
 * 加入氏族
 * POST /clan/:clanId/join
 */
router.post("/clan/:clanId/join", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId } = req.params;
        
        await ClanService.joinClan(clanId, userId);
        resSuccess(res, null, "加入氏族成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "加入氏族失败");
    }
});

/**
 * 离开氏族
 * POST /clan/:clanId/leave
 */
router.post("/clan/:clanId/leave", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId } = req.params;
        
        await ClanService.leaveClan(clanId, userId);
        resSuccess(res, null, "离开氏族成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "离开氏族失败");
    }
});

/**
 * 踢出成员
 * DELETE /clan/:clanId/member/:memberId
 */
router.delete("/clan/:clanId/member/:memberId", auth, async (req: Request, res: Response) => {
    try {
        const operatorId = req.user.userId as number;
        const { clanId, memberId } = req.params;
        
        if (!memberId) {
            return resBadRequest(res, "缺少成员ID");
        }
        
        await ClanService.kickMember(clanId, operatorId, memberId);
        resSuccess(res, null, "踢出成员成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "踢出成员失败");
    }
});

/**
 * 设置管理员
 * POST /clan/:clanId/member/:memberId/admin
 */
router.post("/clan/:clanId/member/:memberId/admin", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId, memberId } = req.params;
        
        if (!memberId) {
            return resBadRequest(res, "缺少成员ID");
        }
        
        await ClanService.setAdmin(clanId, userId, memberId);
        resSuccess(res, null, "设置管理员成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "设置管理员失败");
    }
});

/**
 * 取消管理员
 * DELETE /clan/:clanId/member/:memberId/admin
 */
router.delete("/clan/:clanId/member/:memberId/admin", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId, memberId } = req.params;
        
        if (!memberId) {
            return resBadRequest(res, "缺少成员ID");
        }
        
        await ClanService.unsetAdmin(clanId, userId, memberId);
        resSuccess(res, null, "取消管理员成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "取消管理员失败");
    }
});

/**
 * 转让族长
 * POST /clan/:clanId/transfer
 */
router.post("/clan/:clanId/transfer", auth, async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId as number;
        const { clanId } = req.params;
        const { newLeaderId } = req.body as ITransferLeader;
        
        if (!newLeaderId) {
            return resBadRequest(res, "缺少新族长ID");
        }
        
        await ClanService.transferLeader(clanId, userId, newLeaderId);
        resSuccess(res, null, "转让族长成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "转让族长失败");
    }
});

export default router;