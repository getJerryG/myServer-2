import ContestService from "./ContestService";

/**
 * 竞赛报名管理器
 */
export default class ContestSignUpManager {
    /**
     * 检查是否可以报名
     * @param contestId 竞赛ID
     * @returns 检查结果
     */
    static async checkIfCanSignUp(contestId: number): Promise<{ canSignUp: boolean; reason?: string }> {
        try {
            const contest = await ContestService.getContestById(contestId);
            if (!contest) {
                return { canSignUp: false, reason: "竞赛不存在" };
            }

            // 检查竞赛状态
            if (contest.status !== 3) {
                return { canSignUp: false, reason: "竞赛未开放报名" };
            }

            // 检查报名人数是否已满
            if (contest.currentSignTeams >= contest.maxSignTeams) {
                return { canSignUp: false, reason: "报名人数已满" };
            }

            // 检查报名时间
            const now = new Date();
            if (now < contest.startDay || now > contest.endDay) {
                return { canSignUp: false, reason: "不在报名时间内" };
            }

            return { canSignUp: true };
        } catch (error) {
            throw new Error(`检查报名资格失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
