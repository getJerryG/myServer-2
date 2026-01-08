import ContestTeamRegistrationModel from "../models/ContestTeamRegistrationModel";
import ContestModel from "../models/ContestModel";
import { IContestTeamRegistration } from "../types/contest";

/**
 * 竞赛队伍报名服务类
 */
export default class ContestTeamRegistrationService {
    /**
     * 注册队伍
     * @param registrationData 注册数据
     * @returns 注册结果
     */
    static async registerTeam(registrationData: {
        contestId: string;
        teamId: string;
        teamName: string;
        leaderId: number;
        clanId: string;
    }): Promise<IContestTeamRegistration> {
        try {
            // 检查是否已注册
            const existingRegistration = await ContestTeamRegistrationModel.getRegistrationByContestAndTeam(
                registrationData.contestId,
                registrationData.teamId
            );
            
            if (existingRegistration) {
                throw new Error("队伍已报名该竞赛");
            }
            
            // 创建新的报名记录
            const newRegistration = await ContestTeamRegistrationModel.create(registrationData);
            
            return newRegistration;
        } catch (error) {
            console.error("注册队伍失败:", error);
            throw error;
        }
    }

    /**
     * 删除报名记录
     * @param contestId 竞赛ID
     * @param userId 用户ID
     * @returns 删除结果
     */
    static async deleteRegistration(
        contestId: string,
        userId: number
    ): Promise<boolean> {
        try {
            const result = await ContestTeamRegistrationModel.deleteOne({
                contestId,
                leaderId: userId
            });
            
            return result.deletedCount > 0;
        } catch (error) {
            console.error("删除报名记录失败:", error);
            throw error;
        }
    }

    /**
     * 根据竞赛ID和用户ID获取报名记录
     * @param contestId 竞赛ID
     * @param userId 用户ID
     * @returns 报名记录列表
     */
    static async getRegistrationByContestIdAndUserId(
        contestId: string,
        userId: number
    ): Promise<IContestTeamRegistration[]> {
        try {
            return await ContestTeamRegistrationModel.getRegistrationByContestIdAndUserId(
                contestId,
                userId
            );
        } catch (error) {
            console.error("获取报名记录失败:", error);
            throw error;
        }
    }

    /**
     * 获取竞赛的所有报名记录
     * @param contestId 竞赛ID
     * @returns 报名记录列表
     */
    static async getRegistrationsByContestId(
        contestId: string
    ): Promise<IContestTeamRegistration[]> {
        try {
            // 同时支持字符串和数字类型的contestId查询
            const registrations = await ContestTeamRegistrationModel.find({
                $or: [
                    { contestId: contestId },
                    { contestId: parseInt(contestId) }
                ]
            });
            
            return registrations;
        } catch (error) {
            console.error("获取竞赛报名记录失败:", error);
            throw error;
        }
    }

    /**
     * 同步currentSignTeams字段
     * @param contestId 竞赛ID
     */
    static async syncCurrentSignTeams(contestId: number): Promise<void> {
        try {
            // 查询实际报名队伍数量
            const registrations = await ContestTeamRegistrationModel.find({
                $or: [
                    { contestId: contestId.toString() },
                    { contestId: contestId }
                ]
            });
            
            const actualCount = registrations.length;
            
            // 更新currentSignTeams字段
            await ContestModel.updateOne(
                { contestId },
                { $set: { currentSignTeams: actualCount } }
            );
            
            console.log(`已同步赛事${contestId}的报名队伍数量，实际数量: ${actualCount}`);
        } catch (error) {
            console.error("同步报名队伍数量失败:", error);
        }
    }

    /**
     * 同步所有赛事的currentSignTeams字段
     */
    static async syncAllContestsCurrentSignTeams(): Promise<void> {
        try {
            // 获取所有赛事
            const contests = await ContestModel.find();
            
            for (const contest of contests) {
                await this.syncCurrentSignTeams(contest.contestId);
            }
            
            console.log("已同步所有赛事的报名队伍数量");
        } catch (error) {
            console.error("同步所有赛事报名队伍数量失败:", error);
        }
    }

    /**
     * 根据竞赛ID删除所有队伍注册记录
     * @param contestId 竞赛ID
     */
    static async deleteRegistrationsByContestId(contestId: string): Promise<boolean> {
        try {
            // 同时支持字符串和数字类型的contestId查询
            const result = await ContestTeamRegistrationModel.deleteMany({
                $or: [
                    { contestId: contestId },
                    { contestId: parseInt(contestId) }
                ]
            });
            
            console.log(`已删除赛事${contestId}的${result.deletedCount}条队伍注册记录`);
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`删除赛事${contestId}的队伍注册记录失败:`, error);
            throw error;
        }
    }
}