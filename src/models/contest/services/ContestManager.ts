// 竞赛管理器
import ContestCreationManager from "./ContestCreationManager";
import ContestStatusManager from "./ContestStatusManager";
import { IContest, IContestSchedule, ContestCreateType } from "../types/contest";

// 竞赛管理器
export default class ContestManager {
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
        return await ContestCreationManager.createContestWithSchedules(contestData, schedulesData);
    }

    /**
     * 更新竞赛状态
     * @param contestId 竞赛ID
     * @param status 状态
     * @param operator 操作者
     * @returns 更新后的竞赛
     */
    static async updateContestStatus(contestId: number, status: number, operator: string): Promise<IContest | null> {
        return await ContestStatusManager.updateContestStatus(contestId, status, operator);
    }
}
