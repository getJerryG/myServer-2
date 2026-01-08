import ContestRankingService from "./ContestRankingService";

/**
 * 竞赛排名管理器
 */
export default class ContestRankingManager {
    /**
     * 计算排名和晋级
     * @param contestId 竞赛ID
     * @param scheduleId 赛程ID
     * @returns 排名和晋级结果
     */
    static async calculateRankingAndPromotion(contestId: string, scheduleId: string): Promise<Record<string, unknown>> {
        try {
            // 自动排名
            const rankings = await ContestRankingService.autoRank(scheduleId);

            // 处理晋级
            const promotionResult = await ContestRankingService.processPromotion(scheduleId);

            return { rankings, promotionResult };
        } catch (error) {
            throw new Error(`计算排名和晋级失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
