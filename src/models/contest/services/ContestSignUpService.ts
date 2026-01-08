import ContestModel from "../models/ContestModel";
import { IContest } from "../types/contest";

/**
 * 比赛报名服务
 */
export default class ContestSignUpService {
    /**
     * 增加当前报名队伍数量
     * @param contestId 比赛ID
     * @returns 更新后的比赛对象
     */
    static async incrementCurrentSignTeams(contestId: number): Promise<IContest | null> {
        try {
            return await ContestModel.findOneAndUpdate({ contestId }, { $inc: { currentSignTeams: 1 }}, { new: true });
        } catch (error) {
            throw new Error(`增加当前报名队伍数量失败: ${error}`);
        }
    }

    /**
     * 减少当前报名队伍数量
     * @param contestId 比赛ID
     * @returns 更新后的比赛对象
     */
    static async decrementCurrentSignTeams(contestId: number): Promise<IContest | null> {
        try {
            return await ContestModel.findOneAndUpdate(
                { contestId },
                { $inc: { currentSignTeams: -1 }},
                { new: true }
            );
        } catch (error) {
            throw new Error(`减少当前报名队伍数量失败: ${error}`);
        }
    }
}