import ContestModel from "../models/ContestModel";
import { IContest } from "../types/contest";

/**
 * 比赛状态服务
 */
export default class ContestStatusService {
    /**
     * 更新比赛状态
     * @param contestId 比赛ID
     * @param status 状态
     * @returns 更新后的比赛对象
     */
    static async updateContestStatus(contestId: number, status: number): Promise<IContest | null> {
        try {
            return await ContestModel.findOneAndUpdate({ contestId }, { $set: { status }}, { new: true });
        } catch (error) {
            throw new Error(`更新比赛状态失败: ${error}`);
        }
    }

    /**
     * 批量更新比赛状态
     * @param contestIds 比赛ID列表
     * @param status 状态
     * @returns 是否更新成功
     */
    static async batchUpdateStatus(contestIds: number[], status: number): Promise<boolean> {
        try {
            const result = await ContestModel.updateMany({ contestId: { $in: contestIds }}, { $set: { status }});
            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`批量更新比赛状态失败: ${error}`);
        }
    }
}