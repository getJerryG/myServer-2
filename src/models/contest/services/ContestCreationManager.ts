import ContestService from "./ContestService";
import ContestScheduleService from "./ContestScheduleService";
import { IContest, IContestSchedule, ContestCreateType } from "../types/contest";

/**
 * 竞赛创建管理器
 */
export default class ContestCreationManager {
    /**
     * 创建竞赛和赛程
     * @param contestData 竞赛数据
     * @param schedulesData 赛程数据
     * @returns 竞赛和赛程
     */
    static async createContestWithSchedules(
        contestData: ContestCreateType,
        schedulesData: Record<string, unknown>[]
    ): Promise<{ contest: IContest; schedules: IContestSchedule[] }> {
        try {
            // 创建竞赛
            const contest = await ContestService.createContest(contestData);

            // 创建赛程
            const schedules = await Promise.all(
                schedulesData.map((scheduleData, index) =>
                    ContestScheduleService.createSchedule(contest.contestId, {
                        ...scheduleData,
                        roundOrder: index + 1
                    })
                )
            );

            return { contest, schedules };
        } catch (error) {
            throw new Error(`创建竞赛和赛程失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
