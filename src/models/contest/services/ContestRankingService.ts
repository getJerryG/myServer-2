import ContestRankingModel from "../models/ContestRankingModel";
import ContestPlayerResultModel from "../models/ContestPlayerResultModel";
import ContestScheduleService from "./ContestScheduleService";
import { IContestRanking, PromotionStatus, RankingType } from "../types/contest";
import { IPlayerResult } from "../types/contest-player-result-types";

// 选手比赛结果接口
interface IPlayerMatchResult {
    userId: number;
    nickname: string;
    score?: number;
    role?: string;
    faction?: string;
    isMvp?: boolean;
    isSvp?: boolean;
    isWin?: boolean;
    honor?: string;
}

/**
 * 记录选手比赛结果的参数接口
 */
interface RecordPlayerMatchResultParams {
    contestId: string;
    teamName: string;
    date: string;
    round: number;
    players: IPlayerMatchResult[];
    operator: string;
}

/**
 * 竞赛排名服务类
 */
export default class ContestRankingService {
    /**
     * 自动排名
     * @param scheduleId 赛程ID
     * @returns 排名列表
     */
    static async autoRank(scheduleId: string): Promise<IContestRanking[]> {
        try {
            const schedule = await ContestScheduleService.getSchedule(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            
            const { participatingTeamsCount } = schedule;
            const rankings: IContestRanking[] = [];
            
            // 生成随机排名数据
            for (let i = 0; i < participatingTeamsCount; i++) {
                rankings.push({
                    contest_id: schedule.contest_id,
                    schedule_id: schedule._id,
                    teamId: `team_${i + 1}`,
                    teamName: `队伍${i + 1}`,
                    score: Math.floor(Math.random() * 100), // 随机分数
                    rank: i + 1,
                    promotionStatus: "pending" as PromotionStatus,
                    rankingType: "auto" as RankingType
                });
            }
            
            // 按分数排序
            rankings.sort((a, b) => b.score - a.score);
            
            // 更新排名
            rankings.forEach((rank, index) => {
                rank.rank = index + 1;
            });
            
            // 删除旧排名，插入新排名
            await ContestRankingModel.deleteMany({ schedule_id });
            const savedRankings = await ContestRankingModel.insertMany(rankings);
            
            return savedRankings;
        } catch (error) {
            throw new Error(`自动排名失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 手动排名
     * @param scheduleId 赛程ID
     * @param rankingData 排名数据
     * @param _operator 操作人
     * @returns 排名列表
     */
    static async manualRank(
        scheduleId: string, 
        rankingData: Partial<IContestRanking>[], 
        _operator: string
    ): Promise<IContestRanking[]> {
        try {
            const schedule = await ContestScheduleService.getSchedule(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            
            // 格式化排名数据
            const rankings = rankingData.map((rank) => ({
                contest_id: schedule.contest_id,
                schedule_id: schedule._id,
                teamId: rank.teamId,
                teamName: rank.teamName,
                score: rank.score,
                rank: rank.rank,
                promotionStatus: (rank.promotionStatus || "pending") as PromotionStatus,
                next_schedule_id: rank.next_schedule_id,
                rankingType: "manual" as RankingType
            }));
            
            // 删除旧排名，插入新排名
            await ContestRankingModel.deleteMany({ scheduleId });
            const savedRankings = await ContestRankingModel.insertMany(rankings);
            
            return savedRankings;
        } catch (error) {
            throw new Error(`手动排名失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 根据赛程ID获取排名
     * @param scheduleId 赛程ID
     * @returns 排名列表
     */
    static async getRankingsByScheduleId(scheduleId: string): Promise<IContestRanking[]> {
        try {
            return await ContestRankingModel.getRankingsByScheduleId(scheduleId);
        } catch (error) {
            throw new Error(`获取排名失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 根据竞赛ID和队伍ID获取排名
     * @param contestId 竞赛ID
     * @param teamId 队伍ID
     * @returns 排名列表
     */
    static async getRankingByContestAndTeam(contestId: string, teamId: string): Promise<IContestRanking[]> {
        try {
            return await ContestRankingModel.getRankingByContestAndTeam(contestId, teamId);
        } catch (error) {
            throw new Error(`获取排名失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 处理晋级
     * @param scheduleId 赛程ID
     * @returns 处理结果
     */
    /**
     * 更新单个排名的晋级状态
     */
    private static async updateRankingPromotionStatus(
        rank: IContestRanking,
        promotedCount: number,
        contestId: string,
        roundOrder: number
    ): Promise<IContestRanking> {
        let promotionStatus: PromotionStatus = "pending";
        
        // 根据排名确定晋级状态
        if (rank.rank <= promotedCount) {
            promotionStatus = "promoted";
        } else {
            promotionStatus = "eliminated";
        }
        
        let nextScheduleId = null;
        
        // 获取下一轮赛程
        if (promotionStatus === "promoted") {
            const nextSchedule = await ContestScheduleService.getNextSchedule(
                contestId,
                roundOrder
            );
            
            if (nextSchedule) {
                nextScheduleId = nextSchedule._id;
            }
        }
        
        // 更新排名
        return await ContestRankingModel.findByIdAndUpdate(
            rank._id,
            {
                $set: {
                    promotionStatus,
                    nextScheduleId
                }
            },
            { new: true }
        ) as IContestRanking;
    }

    static async processPromotion(scheduleId: string): Promise<Record<string, unknown>> {
        try {
            const schedule = await ContestScheduleService.getSchedule(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            
            let rankings = await ContestRankingModel.getRankingsByScheduleId(schedule._id);
            
            // 计算晋级队伍数量
            const promotedCount = await ContestScheduleService.calculatePromotedTeams(scheduleId);
            
            // 更新排名状态
            rankings = await Promise.all(rankings.map(async (rank) => {
                return this.updateRankingPromotionStatus(
                    rank, 
                    promotedCount, 
                    schedule.contest_id, 
                    schedule.roundOrder
                );
            }));
            
            // 更新赛程晋级队伍数量
            await ContestScheduleService.updateSchedule(scheduleId, { promotedTeamsCount: promotedCount });
            
            // 统计结果
            const promotedTeams = rankings.filter((r) => r.promotionStatus === "promoted");
            const eliminatedTeams = rankings.filter((r) => r.promotionStatus === "eliminated");
            
            return {
                scheduleId,
                roundName: schedule.roundName,
                promotedCount,
                promotedTeams: promotedTeams.length,
                eliminatedTeams: eliminatedTeams.length,
                rankings
            };
        } catch (error) {
            throw new Error(`处理晋级失败: ${error}`);
        }
    }

    /**
     * 获取赛程晋级队伍
     * @param scheduleId 赛程ID
     * @returns 晋级队伍列表
     */
    static async getPromotedTeamsBySchedule(scheduleId: string): Promise<IContestRanking[]> {
        try {
            return await ContestRankingModel.getPromotedTeamsBySchedule(scheduleId);
        } catch (error) {
            throw new Error(`获取晋级队伍失败: ${error}`);
        }
    }

    /**
     * 获取赛程淘汰队伍
     * @param scheduleId 赛程ID
     * @returns 淘汰队伍列表
     */
    static async getEliminatedTeamsBySchedule(scheduleId: string): Promise<IContestRanking[]> {
        try {
            return await ContestRankingModel.getEliminatedTeamsBySchedule(scheduleId);
        } catch (error) {
            throw new Error(`获取淘汰队伍失败: ${error}`);
        }
    }

    /**
     * 更新排名
     * @param rankingId 排名ID
     * @param rankingData 更新数据
     * @returns 更新后的排名
     */
    static async updateRanking(
        rankingId: string, rankingData: Partial<IContestRanking>
    ): Promise<IContestRanking | null> {
        try {
            return await ContestRankingModel.findByIdAndUpdate(
                rankingId, 
                { $set: rankingData }, 
                { new: true }
            ) as IContestRanking | null;
        } catch (error) {
            throw new Error(`更新排名失败: ${error}`);
        }
    }

    /**
     * 删除赛程排名
     * @param scheduleId 赛程ID
     * @returns 是否删除成功
     */
    static async deleteRankingsBySchedule(scheduleId: string): Promise<boolean> {
        try {
            const result = await ContestRankingModel.deleteMany({ scheduleId });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`删除排名失败: ${error}`);
        }
    }

    /**
     * 更新队伍分数
     * @param scheduleId 赛程ID
     * @param teamId 队伍ID
     * @param score 分数
     * @returns 更新后的排名
     */
    static async updateTeamScore(scheduleId: string, teamId: string, score: number): Promise<IContestRanking | null> {
        try {
            const ranking = await ContestRankingModel.findOne({ scheduleId, teamId });
            if (!ranking) {
                throw new Error("排名不存在");
            }
            
            // 更新分数
            ranking.score = score;
            await ranking.save();
            
            // 重新排名
            await this.autoRank(scheduleId);
            
            // 返回更新后的排名
            return await ContestRankingModel.findOne({ scheduleId, teamId });
        } catch (error) {
            throw new Error(`更新队伍分数失败: ${error}`);
        }
    }

    /**
     * 记录比赛结果
     * @param contestId 竞赛ID
     * @param teamName 队伍名称
     * @param date 日期
     * @param round 轮次
     * @param result 比赛结果
     * @returns 记录结果
     */
    static async recordMatchResult(
        contestId: string, teamName: string, date: string, round: number, result: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
        try {
            const schedule = await ContestScheduleService.getScheduleByRoundOrder(contestId, round);
            if (!schedule) {
                throw new Error(`第${round}轮赛程不存在`);
            }
            
            // 查找当日赛程
            const dailySchedule = schedule.schedule.find((item) => item.date === date);
            if (!dailySchedule) {
                throw new Error(`${date}日赛程不存在`);
            }
            
            // 查找或创建排名
            let ranking = await ContestRankingModel.findOne({ contestId, scheduleId: schedule._id, teamName });
            
            if (!ranking) {
                // 创建新排名
                ranking = new ContestRankingModel({
                    contestId,
                    scheduleId: schedule._id,
                    teamId: `team_${Date.now()}`, // 临时队伍ID，实际应关联队伍表
                    teamName,
                    score: result.score || 0,
                    rank: 0, // 初始排名为0
                    promotionStatus: "pending" as PromotionStatus,
                    nextScheduleId: null,
                    rankingType: "auto" as RankingType
                });
            } else {
                // 更新分数
                ranking.score = result.score || 0;
            }
            
            // 保存排名
            await ranking.save();
            
            // 更新赛程状态
            for (const match of dailySchedule.matches) {
                match.status = "completed";
            }
            
            await schedule.save();
            
            // 重新排名
            await this.autoRank(schedule._id as string);
            
            return {
                success: true,
                message: "比赛结果记录成功",
                data: {
                    contestId,
                    teamName,
                    date,
                    round,
                    score: result.score || 0
                }
            };
        } catch (error) {
            throw new Error(`记录比赛结果失败: ${error}`);
        }
    }

    /**
     * 获取最终排名
     * @param contestId 竞赛ID
     * @returns 最终排名列表
     */
    static async getFinalRanking(contestId: string): Promise<IContestRanking[] | null> {
        try {
            const schedules = await ContestScheduleService.getScheduleByContestId(contestId);
            
            if (schedules.length === 0) {
                return null;
            }
            
            // 获取最后一轮赛程
            const finalSchedule = schedules.reduce((prev, curr) => 
                prev.roundOrder > curr.roundOrder ? prev : curr
            );
            
            // 返回最后一轮排名
            return await this.getRankingsByScheduleId(finalSchedule._id);
        } catch (error) {
            throw new Error(`获取最终排名失败: ${error}`);
        }
    }

    /**
     * 记录选手比赛结果
     * @param contestId 竞赛ID
     * @param teamName 队伍名称
     * @param date 日期
     * @param round 轮次
     * @param players 选手比赛结果数组
     * @param operator 操作人
     * @returns 记录结果
     */


    /**
     * 准备选手结果数据
     */
    private static preparePlayerResults(
        contestId: string,
        scheduleId: string,
        teamName: string,
        matchId: string,
        players: IPlayerMatchResult[]
    ): IPlayerResult[] {
        return players.map((player) => {
            return new ContestPlayerResultModel({
                contestId,
                scheduleId,
                registrationId: null,
                matchId,
                teamName,
                userId: player.userId,
                nickname: player.nickname,
                score: player.score || 0,
                role: player.role || "",
                faction: player.faction || "",
                isMvp: player.isMvp || false,
                isSvp: player.isSvp || false,
                isWin: player.isWin || false,
                honor: player.honor || ""
            });
        });
    }

    /**
     * 更新或创建队伍排名
     */
    private static async updateOrCreateTeamRanking(
        contestId: string,
        scheduleId: string,
        teamName: string,
        teamScore: number
    ): Promise<void> {
        let ranking = await ContestRankingModel.findOne({ contestId, scheduleId, teamName });
        if (!ranking) {
            ranking = new ContestRankingModel({
                contestId,
                scheduleId,
                teamId: `team_${Date.now()}`,
                teamName,
                score: teamScore,
                rank: 0,
                promotionStatus: "pending" as PromotionStatus,
                nextScheduleId: null,
                rankingType: "manual" as RankingType
            });
        } else {
            ranking.score = teamScore;
        }
        await ranking.save();
    }

    static async recordPlayerMatchResult(
        params: RecordPlayerMatchResultParams
    ): Promise<Record<string, unknown>> {
        try {
            const { contestId, teamName, date, round, players, operator } = params;
            
            const schedule = await ContestScheduleService.getScheduleByRoundOrder(contestId, round);
            if (!schedule) {
                throw new Error(`第${round}轮赛程不存在`);
            }

            const dailySchedule = schedule.schedule.find((item) => item.date === date);
            if (!dailySchedule) {
                throw new Error(`${date}日赛程不存在`);
            }

            const matchId = `${contestId}_${schedule._id}_${teamName}_${date}`;

            // 删除旧的比赛结果
            await ContestPlayerResultModel.deletePlayerResultsByMatch(
                contestId,
                schedule._id,
                teamName
            );

            // 准备并插入选手结果
            const playerResults = this.preparePlayerResults(
                contestId,
                schedule._id,
                teamName,
                matchId,
                players
            );
            await ContestPlayerResultModel.insertMany(playerResults);

            // 计算队伍统计数据
            const teamScore = players.reduce((sum, player) => sum + (player.score || 0), 0);
            const hasMvp = players.some((player) => player.isMvp);
            const hasWin = players.some((player) => player.isWin);

            // 更新或创建队伍排名
            await this.updateOrCreateTeamRanking(contestId, schedule._id, teamName, teamScore);

            // 自动排名
            await this.autoRank(schedule._id as string);

            return {
                success: true,
                message: "选手比赛结果记录成功",
                data: {
                    contestId,
                    teamName,
                    date,
                    round,
                    playerCount: players.length,
                    totalScore: teamScore,
                    hasMvp,
                    hasWin,
                    operator
                }
            };
        } catch (error) {
            throw new Error(`记录选手比赛结果失败: ${error}`);
        }
    }

    /**
     * 获取选手比赛结果
     * @param contestId 竞赛ID
     * @param scheduleId 赛程ID
     * @param teamName 队伍名称
     * @returns 选手结果列表
     */
    static async getPlayerResultsByMatch(
        contestId: string,
        scheduleId: string,
        teamName: string
    ): Promise<IPlayerResult[]> {
        try {
            return await ContestPlayerResultModel.getPlayerResultsByMatch(
                contestId,
                scheduleId,
                teamName
            );
        } catch (error) {
            throw new Error(`获取选手比赛结果失败: ${error}`);
        }
    }

    /**
     * 获取选手的所有比赛结果
     * @param contestId 竞赛ID
     * @param userId 用户ID
     * @returns 选手结果列表
     */
    static async getPlayerResultsByUser(
        contestId: string,
        userId: number
    ): Promise<IPlayerResult[]> {
        try {
            return await ContestPlayerResultModel.getPlayerResultsByUser(contestId, userId);
        } catch (error) {
            throw new Error(`获取选手比赛结果失败: ${error}`);
        }
    }

    /**
     * 获取赛程的所有选手结果
     * @param contestId 竞赛ID
     * @param scheduleId 赛程ID
     * @returns 选手结果列表
     */
    static async getPlayerResultsBySchedule(
        contestId: string,
        scheduleId: string
    ): Promise<IPlayerResult[]> {
        try {
            return await ContestPlayerResultModel.getPlayerResultsBySchedule(contestId, scheduleId);
        } catch (error) {
            throw new Error(`获取选手比赛结果失败: ${error}`);
        }
    }
}