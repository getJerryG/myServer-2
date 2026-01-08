import ContestService from "./ContestService";
import { IContest } from "../types/contest";

/**
 * 竞赛状态管理器
 */
export default class ContestStatusManager {
    /**
     * 更新竞赛状态
     * @param contestId 竞赛ID
     * @param status 状态
     * @param _operator 操作者
     * @returns 更新后的竞赛
     */
    static async updateContestStatus(contestId: number, status: number, _operator: string): Promise<IContest | null> {
        try {
            const contest = await ContestService.updateContestStatus(contestId, status);
            if (!contest) {
                throw new Error("竞赛不存在");
            }

            // 根据状态执行相应操作
            switch (status) {
            case 3: // 开放报名
                // 可以添加开放报名的相关逻辑
                break;
            case 4: // 进行中
                // 可以添加竞赛开始的相关逻辑
                break;
            case 5: // 已结束
                // 可以添加竞赛结束的相关逻辑，如计算最终排名等
                break;
            }

            return contest;
        } catch (error) {
            throw new Error(`更新竞赛状态失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
