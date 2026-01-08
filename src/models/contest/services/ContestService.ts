import ContestBasicService from "./ContestBasicService";
import ContestQueryService from "./ContestQueryService";
import ContestStatusService from "./ContestStatusService";
import ContestSignUpService from "./ContestSignUpService";
import { IContest, ContestCreateType } from "../types/contest";

/**
 * 竞赛服务类
 * 整合多个竞赛相关服务，提供统一的竞赛操作接口
 */
export default class ContestService {
    /**
     * 创建竞赛
     * @param contestData 竞赛数据
     * @returns 创建的竞赛
     */
    static async createContest(contestData: ContestCreateType): Promise<IContest> {
        return await ContestBasicService.createContest(contestData);
    }

    /**
     * 根据ID获取竞赛
     * @param contestId 竞赛ID
     * @returns 竞赛信息或null
     */
    static async getContestById(contestId: number): Promise<IContest | null> {
        return await ContestQueryService.getContestById(contestId);
    }

    /**
     * 根据名称获取竞赛
     * @param name 竞赛名称
     * @returns 竞赛信息或null
     */
    static async getContestByName(name: string): Promise<IContest | null> {
        return await ContestQueryService.getContestByName(name);
    }

    /**
     * 获取所有竞赛
     * @returns 竞赛列表
     */
    static async getAllContests(): Promise<IContest[]> {
        return await ContestQueryService.getAllContests();
    }

    /**
     * 根据状态获取竞赛
     * @param status 竞赛状态
     * @returns 竞赛列表
     */
    static async getContestsByStatus(status: number): Promise<IContest[]> {
        return await ContestQueryService.getContestsByStatus(status);
    }

    /**
     * 获取活跃竞赛
     * @returns 活跃竞赛列表
     */
    static async getActiveContests(): Promise<IContest[]> {
        return await ContestQueryService.getActiveContests();
    }

    /**
     * 更新竞赛状态
     * @param contestId 竞赛ID
     * @param status 新状态
     * @returns 更新后的竞赛或null
     */
    static async updateContestStatus(contestId: number, status: number): Promise<IContest | null> {
        return await ContestStatusService.updateContestStatus(contestId, status);
    }

    /**
     * 更新竞赛信息
     * @param contestId 竞赛ID
     * @param contestData 更新数据
     * @returns 更新后的竞赛或null
     */
    static async updateContest(contestId: number, contestData: Partial<ContestCreateType>): Promise<IContest | null> {
        return await ContestBasicService.updateContest(contestId, contestData);
    }

    /**
     * 增加当前报名队伍数
     * @param contestId 竞赛ID
     * @returns 更新后的竞赛或null
     */
    static async incrementCurrentSignTeams(contestId: number): Promise<IContest | null> {
        return await ContestSignUpService.incrementCurrentSignTeams(contestId);
    }

    /**
     * 减少当前报名队伍数
     * @param contestId 竞赛ID
     * @returns 更新后的竞赛或null
     */
    static async decrementCurrentSignTeams(contestId: number): Promise<IContest | null> {
        return await ContestSignUpService.decrementCurrentSignTeams(contestId);
    }

    /**
     * 删除竞赛
     * @param contestId 竞赛ID
     * @returns 是否删除成功
     */
    static async deleteContest(contestId: number): Promise<boolean> {
        return await ContestBasicService.deleteContest(contestId);
    }

    /**
     * 批量更新竞赛状态
     * @param contestIds 竞赛ID列表
     * @param status 新状态
     * @returns 是否更新成功
     */
    static async batchUpdateStatus(contestIds: number[], status: number): Promise<boolean> {
        return await ContestStatusService.batchUpdateStatus(contestIds, status);
    }
}