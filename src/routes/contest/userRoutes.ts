import express, { Request, Response, Router } from "express";
import { ContestService } from "@/models/contest";
import ContestTeamRegistrationService from "@/models/contest/services/ContestTeamRegistrationService";
import ContestScheduleService from "@/models/contest/services/ContestScheduleService";
import ContestTeamRegistrationModel from "@/models/contest/models/ContestTeamRegistrationModel";
import ClanService from "@/models/clan/services/clanService";
import ClanMember from "@/models/clan/data/clanMember";
import UserService from "@/models/User/services/userService";
import { MemberRole } from "@/models/clan/types/clan";
import authMiddleware from "@/middlewares/auth";
import { resSuccess, resError, resNotFound, resBadRequest } from "../../utils/res";

const router: Router = express.Router();

interface ContestListItem {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    isFull: boolean;
    status: number;
}

interface Contest {
    contestId: number;
    name: string;
    startDay: string;
    endDay: string;
    currentSignTeams: number;
    maxSignTeams: number;
    status: number;
}

interface SubmitTeamMemberRequest {
    id: string | number;
    members: TeamMember[];
    teamName: string;
    leader?: string;
}

interface TeamMember {
    userId: number;
    username: string;
}

/**
 * @module 用户竞赛路由
 * @description 用户竞赛相关接口
 */

/**
 * 获取竞赛详情
 * @method GET
 * @route /contest
 * @returns 竞赛详情
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
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
        
        resSuccess(res, contest, "获取竞赛详情成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取竞赛列表
 * @method GET
 * @route /contest/lists
 * @returns 竞赛列表
 */
router.get("/lists", authMiddleware, async (req: Request, res: Response) => {
    try {
        const nickname = req.query.nickname as string;
        let data: ContestListItem[] = [];
        
        if (nickname) {
            // 按昵称筛选的逻辑
            data = [];
        } else {
            const allContests: Contest[] = await ContestService.getAllContests();
            data = allContests.map((contest) => ({
                id: contest.contestId,
                name: contest.name,
                startTime: contest.startDay,
                endTime: contest.endDay,
                isFull: contest.currentSignTeams >= contest.maxSignTeams,
                status: contest.status
            }));
        }
        
        resSuccess(res, data, "获取竞赛列表成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 报名竞赛
 * @method POST
 * @route /contest/signUp
 * @returns 报名结果
 */
router.post("/signUp", authMiddleware, async (req: Request, res: Response) => {
    try {
        const idParam = req.body.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const userId = req.user?.userId as number;
        
        // 1. 检查竞赛是否存在
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 2. 检查竞赛是否可报名
        if (contest.status !== 1) {
            return resBadRequest(res, "竞赛未开始报名");
        }
        
        // 3. 获取用户所属家族
        const user = await UserService.getUser(userId);
        if (!user) {
            return resNotFound(res, "用户不存在");
        }
        
        const clanMember = await ClanMember.findOne({ userId: user._id });
        if (!clanMember) {
            return resBadRequest(res, "用户未加入家族");
        }
        
        if (clanMember.role !== MemberRole.LEADER) {
            return resBadRequest(res, "只有族长可以报名竞赛");
        }
        
        const userClan = await ClanService.getClan(clanMember.clanId.toString());
        if (!userClan) {
            return resNotFound(res, "家族不存在");
        }
        
        // 4. 检查是否已报名
        const existingRegistration = await ContestTeamRegistrationModel.getRegistrationByContestAndTeam(
            id.toString(),
            userClan._id
        );
        if (existingRegistration) {
            return resBadRequest(res, "家族已报名该竞赛");
        }
        
        // 5. 报名竞赛
        await ContestTeamRegistrationService.registerTeam({
            contestId: id.toString(),
            teamId: userClan._id,
            teamName: userClan.name,
            leaderId: userId,
            clanId: userClan._id,
        });
        
        // 6. 增加当前报名队伍数
        await ContestService.incrementCurrentSignTeams(id);
        
        // 返回结果
        resSuccess(res, {
            contestId: id,
            userId: userId,
            status: "success"
        }, "报名成功");
        
        console.log(`用户 ${userId} 报名竞赛 ${id} 成功`);
    } catch (error) {
        console.error(`报名竞赛失败: ${error}`);
        resError(res, 500, "报名失败");
    }
});

/**
 * 取消报名
 * @method PUT
 * @route /contest/unSignUp
 * @returns 取消报名结果
 */
router.put("/unSignUp", authMiddleware, async (req: Request, res: Response) => {
    try {
        const idParam = req.body.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const userId = req.user?.userId as number;
        
        // 1. 检查竞赛是否存在
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 2. 检查竞赛是否可取消报名
        if (contest.status !== 0) {
            return resBadRequest(res, "竞赛已开始或已结束，无法取消报名");
        }
        
        // 3. 获取报名记录
        const registrations = await ContestTeamRegistrationService.getRegistrationByContestIdAndUserId(
            id.toString(),
            userId
        );
        if (registrations.length === 0) {
            return resBadRequest(res, "未找到报名记录");
        }
        
        // 4. 取消报名
        await ContestTeamRegistrationService.deleteRegistration(id.toString(), userId);
        
        // 5. 减少当前报名队伍数
        await ContestService.decrementCurrentSignTeams(id);
        
        console.log(`用户 ${userId} 取消报名竞赛 ${id} 成功`);
        
        resSuccess(res, {
            contestId: id,
            userId: userId,
            status: "success"
        }, "取消报名成功");
    } catch (_error) {
        resError(res, 500, "取消报名失败");
    }
});

/**
 * 提交队伍成员
 * @method POST
 * @route /contest/submitTeamMember
 * @returns 提交结果
 */
router.post("/submitTeamMember", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id, members, teamName, leader } = req.body as SubmitTeamMemberRequest;
        
        if (!id) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        if (!teamName) {
            return resBadRequest(res, "缺少队伍名称");
        }
        
        const idNum = Number(id);
        if (isNaN(idNum)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const contest = await ContestService.getContestById(idNum);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加提交队伍成员的逻辑
        resSuccess(res, { teamName, leader, members }, "提交队伍成员成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取队伍成员
 * @method GET
 * @route /contest/teamMember
 * @returns 队伍成员列表
 */
router.get("/teamMember", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取队伍成员的逻辑
        resSuccess(res, { members: [] }, "获取队伍成员成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取竞赛状态历史
 * @method GET
 * @route /contest/status-history
 * @returns 状态历史
 */
router.get("/status-history", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取状态历史的逻辑
        resSuccess(res, [], "获取状态历史成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 提交竞赛结果
 * @method POST
 * @route /contest/submit
 * @returns 提交结果
 */
router.post("/submit", authMiddleware, async (req: Request, res: Response) => {
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
        
        const updatedContest = await ContestService.updateContestStatus(id, 2); // 假设2是已结束状态
        if (!updatedContest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, { status: updatedContest.status }, "竞赛结果提交成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取竞赛排名
 * @method GET
 * @route /contest/ranking
 * @returns 竞赛排名
 */
router.get("/ranking", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取竞赛排名的逻辑
        resSuccess(res, {
            ranking: [],
            rankingType: "score",
            rankingUpdatedAt: Date.now()
        }, "获取竞赛排名成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 自动生成排名
 * @method POST
 * @route /contest/ranking/auto
 * @returns 生成结果
 */
router.post("/ranking/auto", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加自动生成排名的逻辑
        resSuccess(res, {
            ranking: [],
            rankingType: "score",
            rankingUpdatedAt: Date.now()
        }, "自动生成排名成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取淘汰规则
 * @method GET
 * @route /contest/elimination-rule
 * @returns 淘汰规则
 */
router.get("/elimination-rule", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取淘汰规则的逻辑
        resSuccess(res, {}, "获取淘汰规则成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取队伍晋级状态
 * @method GET
 * @route /contest/teams/:teamName/promotion-status
 * @returns 晋级状态
 */
router.get("/teams/:teamName/promotion-status", authMiddleware, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const { teamName } = req.params;
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加获取队伍晋级状态的逻辑
        resSuccess(res, {
            teamName,
            promotionStatus: "pending"
        }, "获取队伍晋级状态成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 根据状态获取竞赛
 * @method GET
 * @route /contest/by-status/:status
 * @returns 竞赛列表
 */
router.get("/by-status/:status", authMiddleware, async (req: Request, res: Response) => {
    try {
        const status = Number(req.params.status);
        const contests = await ContestService.getContestsByStatus(status);
        
        resSuccess(res, contests, "获取竞赛列表成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取活跃竞赛
 * @method GET
 * @route /contest/active
 * @returns 活跃竞赛列表
 */
router.get("/active", authMiddleware, async (_req: Request, res: Response) => {
    try {
        const contests = await ContestService.getActiveContests();
        
        resSuccess(res, contests, "获取活跃竞赛成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 根据名称获取竞赛
 * @method GET
 * @route /contest/by-name/:name
 * @returns 竞赛详情
 */
router.get("/by-name/:name", authMiddleware, async (req: Request, res: Response) => {
    try {
        const {name} = req.params;
        const contest = await ContestService.getContestByName(name);
        
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        resSuccess(res, contest, "获取竞赛详情成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 提交宣传阶段
 * @method POST
 * @route /contest/publicity-stages/:stageId/submit
 * @returns 提交结果
 */
router.post("/publicity-stages/:stageId/submit", authMiddleware, async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        if (!idParam) {
            return resBadRequest(res, "缺少竞赛ID");
        }
        
        const id = Number(idParam);
        if (isNaN(id)) {
            return resBadRequest(res, "无效的竞赛ID");
        }
        
        const { stageId } = req.params;
        const contest = await ContestService.getContestById(id);
        if (!contest) {
            return resNotFound(res, "竞赛不存在");
        }
        
        // 这里可以添加提交宣传阶段的逻辑
        resSuccess(res, {
            stageId,
            status: "submitted"
        }, "提交宣传阶段成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取宣传状态
 * @method GET
 * @route /contest/publicity-status
 * @returns 宣传状态
 */
router.get("/publicity-status", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取宣传状态的逻辑
        resSuccess(res, {
            isPublicityPeriod: false,
            currentStatus: []
        }, "获取宣传状态成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取宣传阶段
 * @method GET
 * @route /contest/publicity-stages
 * @returns 宣传阶段列表
 */
router.get("/publicity-stages", authMiddleware, async (req: Request, res: Response) => {
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
        
        // 这里可以添加获取宣传阶段的逻辑
        resSuccess(res, [], "获取宣传阶段成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取赛程
 * @method GET
 * @route /contest/schedules
 * @returns 赛程列表
 */
router.get("/schedules", authMiddleware, async (req: Request, res: Response) => {
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
        
        const schedules = await ContestScheduleService.getScheduleByContestId(id);
        resSuccess(res, schedules, "获取赛程成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取今日赛程
 * @method GET
 * @route /contest/today-schedule
 * @returns 今日赛程
 */
router.get("/today-schedule", authMiddleware, async (req: Request, res: Response) => {
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
        
        const todaySchedule = await ContestScheduleService.getScheduleByContestDay(contest);
        resSuccess(res, todaySchedule, "获取今日赛程成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 获取今天流程
 * @method GET
 * @route /contest/today-flow
 * @returns 今天流程
 */
router.get("/today-flow", authMiddleware, async (_req: Request, res: Response) => {
    try {
        const todayFlow = await ContestScheduleService.getTodayFlow();
        resSuccess(res, todayFlow, "获取今天流程成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 显示今天的比赛信息
 * @method GET
 * @route /contest/today-matches
 * @returns 今天的比赛信息
 */
router.get("/today-matches", authMiddleware, async (req: Request, res: Response) => {
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
        
        const todayDate = new Date().toISOString().split("T")[0];
        const schedules = await ContestScheduleService.getScheduleByContestId(id);
        
        const todayMatches = [];
        schedules.forEach(schedule => {
            const todaySchedule = schedule.schedule.find((daily: Record<string, unknown>) => daily.date === todayDate);
            if (todaySchedule && todaySchedule.matches.length > 0) {
                todayMatches.push({
                    roundName: schedule.roundName,
                    roundOrder: schedule.roundOrder,
                    matches: todaySchedule.matches
                });
            }
        });
        
        resSuccess(res, todayMatches, "获取今天的比赛信息成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

/**
 * 显示当前报名队伍信息
 * @method GET
 * @route /contest/registered-teams
 * @returns 当前报名队伍信息
 */
router.get("/registered-teams", authMiddleware, async (req: Request, res: Response) => {
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
        
        const teams = await ContestTeamRegistrationService.getRegistrationsByContestId(id.toString());
        resSuccess(res, teams, "获取当前报名队伍信息成功");
    } catch (error) {
        resError(res, 400, (error as Error).message);
    }
});

export default router;