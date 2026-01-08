import ContestModel from "../models/ContestModel";
import { IContest } from "../types/contest";
import ContestAutoStatusUpdateService from "./ContestAutoStatusUpdateService";

/**
 * 比赛查询服务
 */
export default class ContestQueryService {
    /**
     * 根据ID获取比赛
     * @param contestId 比赛ID
     * @returns 比赛对象
     */
    static async getContestById(contestId: number): Promise<IContest | null> {
        try {
            const contest = await ContestModel.getContestById(contestId);
            if (contest) {
                // 更新为动态计算的状态
                contest.status = ContestAutoStatusUpdateService.getDynamicStatus(contest);
            }
            return contest;
        } catch (error) {
            throw new Error(`根据ID获取比赛失败: ${error}`);
        }
    }

    /**
     * 根据名称获取比赛
     * @param name 比赛名称
     * @returns 比赛对象
     */
    static async getContestByName(name: string): Promise<IContest | null> {
        try {
            const contest = await ContestModel.findOne({ name });
            if (contest) {
                // 更新为动态计算的状态
                contest.status = ContestAutoStatusUpdateService.getDynamicStatus(contest);
            }
            return contest;
        } catch (error) {
            throw new Error(`根据名称获取比赛失败: ${error}`);
        }
    }

    /**
     * 获取所有比赛
     * @returns 比赛列表
     */
    static async getAllContests(): Promise<IContest[]> {
        try {
            const contests = await ContestModel.find({});
            // 更新为动态计算的状态
            return contests.map(contest => {
                contest.status = ContestAutoStatusUpdateService.getDynamicStatus(contest);
                return contest;
            });
        } catch (error) {
            throw new Error(`获取所有比赛失败: ${error}`);
        }
    }

    /**
     * 根据状态获取比赛
     * @param status 比赛状态
     * @returns 比赛列表
     */
    static async getContestsByStatus(status: number): Promise<IContest[]> {
        try {
            const contests = await ContestModel.find({});
            // 先更新所有比赛的动态状态，再根据状态过滤
            return contests
                .map(contest => {
                    contest.status = ContestAutoStatusUpdateService.getDynamicStatus(contest);
                    return contest;
                })
                .filter(contest => contest.status === status);
        } catch (error) {
            throw new Error(`根据状态获取比赛失败: ${error}`);
        }
    }

    /**
     * 获取活跃比赛
     * @returns 活跃比赛列表
     */
    static async getActiveContests(): Promise<IContest[]> {
        try {
            const contests = await ContestModel.find({});
            // 更新为动态计算的状态，然后过滤活跃状态（进行中、已结束、已取消）
            return contests
                .map(contest => {
                    contest.status = ContestAutoStatusUpdateService.getDynamicStatus(contest);
                    return contest;
                })
                .filter(contest => [2, 3, 4].includes(contest.status));
        } catch (error) {
            throw new Error(`获取活跃比赛失败: ${error}`);
        }
    }
}