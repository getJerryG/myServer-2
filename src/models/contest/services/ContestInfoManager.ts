import ContestService from "./ContestService";
import ContestScheduleService from "./ContestScheduleService";
import ContestRankingService from "./ContestRankingService";

/**
 * 竞赛信息管理器
 */
export default class ContestInfoManager {
    /**
     * 获取竞赛完整信息
     * @param contestId 竞赛ID
     * @returns 竞赛完整信息
     */
    static async getContestFullInfo(contestId: number): Promise<Record<string, unknown>> {
        try {
            // 获取竞赛信息
            const contest = await ContestService.getContestById(contestId);
            if (!contest) {
                throw new Error("竞赛不存在");
            }

            // 获取赛程信息
            const schedules = await ContestScheduleService.getScheduleByContestId(contest.contestId);

            // 获取排名信息
            const rankings = await Promise.all(
                schedules.map((schedule) => ContestRankingService.getRankingsByScheduleId(schedule._id))
            );

            return {
                contest,
                schedules,
                rankings
            };
        } catch (error) {
            throw new Error(`获取竞赛完整信息失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
