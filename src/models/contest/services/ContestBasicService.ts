import ContestModel from "../models/ContestModel";
import { IContest, ContestCreateType } from "../types/contest";

/**
 * 比赛基础服务 - CRUD操作
 */
export default class ContestBasicService {
    /**
     * 创建比赛
     * @param contestData 比赛数据
     * @returns 创建的比赛对象
     */
    static async createContest(contestData: ContestCreateType): Promise<IContest> {
        try {
            const existingContest = await ContestModel.findOne({ name: contestData.name });
            if (existingContest) {
                throw new Error(`比赛名称已存在: "${contestData.name}"`);
            }
            const contest = new ContestModel(contestData);
            return await contest.save();
        } catch (error) {
            throw new Error(`创建比赛失败: ${error}`);
        }
    }

    /**
     * 更新比赛
     * @param contestId 比赛ID
     * @param contestData 比赛数据
     * @returns 更新后的比赛对象
     */
    static async updateContest(contestId: number, contestData: Partial<ContestCreateType>): Promise<IContest | null> {
        try {
            return await ContestModel.findOneAndUpdate({ contestId }, { $set: contestData }, { new: true });
        } catch (error) {
            throw new Error(`更新比赛失败: ${error}`);
        }
    }
    /**
     * 删除比赛
     * @param contestId 比赛ID
     * @returns 是否删除成功
     */
    static async deleteContest(contestId: number): Promise<boolean> {
        try {
            const result = await ContestModel.deleteOne({ contestId });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`删除比赛失败: ${error}`);
        }
    }
}