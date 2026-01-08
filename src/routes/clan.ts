import express, { Request, Response, Router } from "express";
import { resSuccess, resCreated, resBadRequest, resNotFound, resError } from "../utils/res";
import Clan from "@/models/clan/Clan";
import clans from "@/models/clan";
import authMiddleware from "@/middlewares/auth";
import { SuperAdmin } from "@/middlewares/role";

const router: Router = express.Router();

// 创建战队
router.post("/", authMiddleware, (req: Request, res: Response) => {
    try {
        const { name, leader, introduction, coverUrl, avatarUrl } = req.body;

        if (!name || !leader) {
            return resBadRequest(res, "缺少必填字段");
        }

        const newClan = new Clan({
            name,
            leader,
            introduction,
            coverUrl,
            avatarUrl
        });

        clans.addClan(newClan);

        resCreated(res, newClan.data, "战队创建成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 获取战队信息
router.get("/", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const clan = clans.getClan(clanName);

        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        resSuccess(res, clan.data, "获取战队信息成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 获取战队列表
router.get("/lists", authMiddleware, (req: Request, res: Response) => {
    try {
        const allClans = Array.from(clans.clans.values());
        const clansData = allClans.map((clan) => clan.data);

        resSuccess(res, {
            list: clansData,
            total: clansData.length
        }, "获取战队列表成功");
    } catch (error) {
        resError(res, 500, (error as Error).message);
    }
});

// 更新战队信息
router.put("/", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const { introduction, coverUrl, avatarUrl } = req.body;

        const clan = clans.getClan(clanName);
        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        if (introduction) {
            clan.introduction = introduction;
        }
        if (coverUrl) {
            clan.coverUrl = coverUrl;
        }
        if (avatarUrl) {
            clan.avatarUrl = avatarUrl;
        }

        clan.cacheBasicInfo();

        resSuccess(res, clan.data, "战队信息更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 删除战队
router.delete("/", authMiddleware, SuperAdmin, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const clan = clans.getClan(clanName);

        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        clans.clans.delete(clanName);

        resSuccess(res, null, "战队删除成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 添加成员
router.post("/member", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const { members } = req.body;

        const clan = clans.getClan(clanName);
        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        clan.addMember(members);

        resSuccess(res, {
            members: clan.members
        }, "成员添加成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 移除成员
router.delete("/member", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const { nickname } = req.body;

        const clan = clans.getClan(clanName);
        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        clan.removeMember(nickname);

        resSuccess(res, {
            members: clan.members
        }, "成员移除成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 更新成员角色
router.put("/member/role", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const { nickname, role } = req.body;

        const clan = clans.getClan(clanName);
        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        const member = clan.getMember(nickname);
        if (!member) {
            return resNotFound(res, "成员不存在");
        }

        if (role === "admin") {
            clan.setAdmin(nickname);
        }

        resSuccess(res, {
            member: clan.getMember(nickname),
            isAdmin: clan.isAdmin(nickname)
        }, "角色更新成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 获取战队统计
router.get("/stats", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const clan = clans.getClan(clanName);

        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        const stats = {
            totalGames: 100,
            winRate: 0.65,
            mvpCount: 20,
            svpCount: 15,
            totalExp: 5000,
            ranking: 10
        };

        resSuccess(res, stats, "获取战队统计成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

// 获取成员统计
router.get("/member/stats", authMiddleware, (req: Request, res: Response) => {
    try {
        const clanName = req.query.clanName as string;
        const nickname = req.query.nickname as string;

        const clan = clans.getClan(clanName);
        if (!clan) {
            return resNotFound(res, "战队不存在");
        }

        const member = clan.getMember(nickname);
        if (!member) {
            return resNotFound(res, "成员不存在");
        }

        const memberStats = {
            totalGames: 50,
            winRate: 0.7,
            mvpCount: 10,
            svpCount: 8,
            totalExp: 2500,
            ranking: 5
        };

        resSuccess(res, memberStats, "获取成员统计成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

export default router;