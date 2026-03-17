import express, { Request, Response, Router } from "express";
import { resSuccess, resError, resBadRequest } from "../../utils/res";
import { ContestRankingService } from "@/models/contest";
import authMiddleware from "@/middlewares/auth";
import { contestAdminPermission } from "../../middlewares/contestAdmin";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: string | number;
            username?: string;
        };
    }
}

const router: Router = express.Router();

/**
 * @module 赛事管理员路由
 * @description 赛事管理员专用接口，包括提交选手比赛数据等
 */

/**
 * 提交选手比赛结果
 * @method POST
 * @route /contest/:id/player-result
 * @权限 赛事管理员（需具有submitData权限）
 * @请求参数
 *  - date: 比赛日期（YYYY-MM-DD）
 *  - round: 轮次
 *  - teamName: 队伍名称
 *  - players: 选手数据数组
 *    - userId: 用户ID
 *    - nickname: 昵称
 *    - score: 得分
 *    - role: 角色（可选）
 *    - faction: 阵营（可选）
 *    - isMvp: 是否MVP（可选）
 *    - isSvp: 是否SVP（可选）
 *    - isWin: 是否获胜（可选）
 *    - honor: 荣誉（可选）
 * @returns 提交结果
 */
router.post(
    "/:id/player-result",
    authMiddleware,
    contestAdminPermission({ requirePermission: "submitData" }),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const contestId = Number(id);

            if (isNaN(contestId)) {
                return resBadRequest(res, "无效的竞赛ID");
            }

            const { date, round, teamName, players } = req.body;

            if (!date || !round || !teamName || !players) {
                return resBadRequest(res, "缺少必要的参数：date、round、teamName、players");
            }

            if (!Array.isArray(players) || players.length === 0) {
                return resBadRequest(res, "players参数必须是非空数组");
            }

            const operator = req.user?.userId?.toString() || "unknown";

            const result = await ContestRankingService.recordPlayerMatchResult(
                contestId.toString(),
                teamName,
                date,
                round,
                players,
                operator
            );

            resSuccess(res, result.data, result.message);
        } catch (error) {
            console.error("提交选手比赛结果失败:", error);
            resError(res, 400, (error as Error).message);
        }
    }
);

/**
 * 获取选手比赛结果
 * @method GET
 * @route /contest/:id/player-result
 * @权限 赛事管理员（需具有view权限）
 * @查询参数
 *  - scheduleId: 赛程ID（可选）
 *  - teamName: 队伍名称（可选）
 *  - userId: 用户ID（可选）
 * @returns 选手结果列表
 */
router.get(
    "/:id/player-result",
    authMiddleware,
    contestAdminPermission({ requirePermission: "view" }),
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const contestId = Number(id);

            if (isNaN(contestId)) {
                return resBadRequest(res, "无效的竞赛ID");
            }

            const { scheduleId, teamName, userId } = req.query;

            let playerResults;

            if (scheduleId && teamName) {
                playerResults = await ContestRankingService.getPlayerResultsByMatch(
                    contestId.toString(),
                    scheduleId as string,
                    teamName as string
                );
            } else if (userId) {
                playerResults = await ContestRankingService.getPlayerResultsByUser(
                    contestId.toString(),
                    Number(userId)
                );
            } else if (scheduleId) {
                playerResults = await ContestRankingService.getPlayerResultsBySchedule(
                    contestId.toString(),
                    scheduleId as string
                );
            } else {
                return resBadRequest(res, "请提供scheduleId、teamName或userId参数");
            }

            resSuccess(res, playerResults, "获取选手比赛结果成功");
        } catch (error) {
            console.error("获取选手比赛结果失败:", error);
            resError(res, 400, (error as Error).message);
        }
    }
);

export default router;
