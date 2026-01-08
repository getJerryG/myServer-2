import ContestScheduleModel from "../models/ContestScheduleModel";
import { IContestSchedule, ContestScheduleCreateType, EliminationInfo, MatchInfo, DailySchedule } from "../types/contest-schedule-types";
import { ContestService } from "../index";
import ContestAutoStatusUpdateService from "./ContestAutoStatusUpdateService";
import werewolfEditions from "models/Game/config/werewolfKillEdition";

/**
 * 比赛赛程服务
 */
export default class ContestScheduleService {
    /**
     * 验证赛程中的所有比赛版型
     * @param schedule 赛程中的每天安排
     */
    private static validateScheduleMatches(schedule: DailySchedule[]): void {
        for (const dailySchedule of schedule) {
            const date = dailySchedule.date;
            // 计算日期对应的星期几（1-7，1代表周一，7代表周日）
            const dateObj = new Date(date);
            let weekDay = dateObj.getDay();
            weekDay = weekDay === 0 ? 7 : weekDay;
            
            for (const match of dailySchedule.matches) {
                const matchVersion = match.edition || "标准场";
                
                // 验证版型在当天是否开放
                const edition = werewolfEditions.get(matchVersion);
                if (!edition) {
                    throw new Error(`无效的版型: ${matchVersion}`);
                }
                
                // 检查版型的openDay数组中是否包含该星期几
                if (!edition.openDay.includes(weekDay)) {
                    throw new Error(`版型 ${matchVersion} 在星期${weekDay}不开放`);
                }
            }
        }
    }

    /**
     * 创建赛程
     * @param contestId 比赛ID
     * @param scheduleData 赛程数据
     * @param options 可选配置
     * @returns 创建的赛程对象
     */
    static async createSchedule(
        contestId: string | number, 
        scheduleData: ContestScheduleCreateType,
        options: { autoUpdateContestTime?: boolean } = { autoUpdateContestTime: false }
    ): Promise<IContestSchedule> {
        try {
            // 1. 获取赛事信息
            const contest = await ContestService.getContestById(Number(contestId));
            if (!contest) {
                throw new Error(`赛事不存在: ${contestId}`);
            }

            // 2. 验证赛程时间
            const { startDate, endDate, roundName, schedule } = scheduleData;
            if (!startDate || !endDate) {
                throw new Error("赛程必须包含开始时间和结束时间");
            }

            if (startDate > endDate) {
                throw new Error("赛程开始时间不能晚于结束时间");
            }

            // 3. 验证roundName唯一性
            if (!roundName) {
                throw new Error("赛程必须包含轮次名称");
            }

            const existingSchedule = await ContestScheduleModel.findOne({ 
                contest_id: contestId, 
                roundName 
            });
            if (existingSchedule) {
                throw new Error(`赛事中已存在名为"${roundName}"的赛程`);
            }

            // 4. 处理赛事时间更新
            const updateContestData: Record<string, Date> = {};
            if (startDate < contest.startDay) {
                if (options.autoUpdateContestTime) {
                    updateContestData.startDay = startDate;
                } else {
                    throw new Error("赛程开始时间不能早于赛事开始时间");
                }
            }

            if (endDate > contest.endDay) {
                if (options.autoUpdateContestTime) {
                    updateContestData.endDay = endDate;
                } else {
                    throw new Error("赛程结束时间不能晚于赛事结束时间");
                }
            }

            // 5. 验证赛程中的比赛版型
            if (schedule && schedule.length > 0) {
                this.validateScheduleMatches(schedule);
            }

            // 6. 如果需要，更新赛事时间
            if (Object.keys(updateContestData).length > 0) {
                await ContestService.updateContest(Number(contestId), updateContestData);
            }

            // 7. 创建赛程
            const newSchedule = new ContestScheduleModel({
                ...scheduleData,
                contest_id: contestId,
            });
            return await newSchedule.save();
        } catch (error) {
            throw new Error(`创建赛程失败: ${error}`);
        }
    }

    /**
     * 获取赛程
     * @param scheduleId 赛程ID
     * @returns 赛程对象
     */
    static async getSchedule(scheduleId: string): Promise<IContestSchedule | null> {
        try {
            return await ContestScheduleModel.findById(scheduleId);
        } catch (error) {
            throw new Error(`获取赛程失败: ${error}`);
        }
    }

    /**
     * 为赛程中的所有比赛更新动态状态
     * @param schedule 赛程对象
     * @returns 更新了动态状态的赛程对象
     */
    private static updateDynamicMatchStatuses(schedule: IContestSchedule): IContestSchedule {
        const updatedSchedule = { ...schedule.toObject() };
        
        // 更新每个比赛的动态状态
        for (const dailySchedule of updatedSchedule.schedule) {
            for (const match of dailySchedule.matches) {
                match.status = ContestAutoStatusUpdateService.getDynamicMatchStatus(match, dailySchedule.date);
            }
        }
        
        return updatedSchedule as IContestSchedule;
    }

    /**
     * 根据比赛ID获取赛程
     * @param contestId 比赛ID
     * @returns 赛程列表
     */
    static async getScheduleByContestId(contestId: string | number): Promise<IContestSchedule[]> {
        try {
            // 将string类型转换为number，以匹配赛程模型的number类型要求
            const contestIdNum = Number(contestId);
            const schedules = await ContestScheduleModel.getScheduleByContestId(contestIdNum);
            
            // 更新每个赛程中比赛的动态状态
            return schedules.map(schedule => this.updateDynamicMatchStatuses(schedule));
        } catch (error) {
            throw new Error(`根据比赛ID获取赛程失败: ${error}`);
        }
    }

    /**
     * 根据轮次获取赛程
     * @param contestId 比赛ID
     * @param roundOrder 轮次
     * @returns 赛程对象
     */
    static async getScheduleByRoundOrder(contestId: string | number, roundOrder: number): Promise<IContestSchedule | null> {
        try {
            // 将string类型转换为number，以匹配赛程模型的number类型要求
            const contestIdNum = Number(contestId);
            const schedule = await ContestScheduleModel.getScheduleByRoundOrder(contestIdNum, roundOrder);
            
            // 更新比赛的动态状态
            return schedule ? this.updateDynamicMatchStatuses(schedule) : null;
        } catch (error) {
            throw new Error(`根据轮次获取赛程失败: ${error}`);
        }
    }

    /**
     * 获取下一轮赛程
     * @param contestId 比赛ID
     * @param currentRoundOrder 当前轮次
     * @returns 下一轮赛程对象
     */
    static async getNextSchedule(contestId: string | number, currentRoundOrder: number): Promise<IContestSchedule | null> {
        try {
            // 将string类型转换为number，以匹配赛程模型的number类型要求
            const contestIdNum = Number(contestId);
            const schedule = await ContestScheduleModel.getNextSchedule(contestIdNum, currentRoundOrder);
            
            // 更新比赛的动态状态
            return schedule ? this.updateDynamicMatchStatuses(schedule) : null;
        } catch (error) {
            throw new Error(`获取下一轮赛程失败: ${error}`);
        }
    }

    /**
     * 更新赛程
     * @param scheduleId 赛程ID
     * @param scheduleData 赛程数据
     * @returns 更新后的赛程对象
     */
    static async updateSchedule(
        scheduleId: string, scheduleData: Partial<ContestScheduleCreateType>
    ): Promise<IContestSchedule | null> {
        try {
            // 验证赛程中的比赛版型
            if (scheduleData.schedule && scheduleData.schedule.length > 0) {
                this.validateScheduleMatches(scheduleData.schedule);
            }
            
            const schedule = await ContestScheduleModel.findByIdAndUpdate(scheduleId, { $set: scheduleData }, { new: true });
            
            // 更新比赛的动态状态
            return schedule ? this.updateDynamicMatchStatuses(schedule) : null;
        } catch (error) {
            throw new Error(`更新赛程失败: ${error}`);
        }
    }

    /**
     * 更新淘汰信息
     * @param scheduleId 赛程ID
     * @param eliminationInfo 淘汰信息
     * @returns 更新后的赛程对象
     */
    static async updateEliminationInfo(
        scheduleId: string, eliminationInfo: EliminationInfo
    ): Promise<IContestSchedule | null> {
        try {
            const schedule = await ContestScheduleModel.findByIdAndUpdate(
                scheduleId,
                { $set: { eliminationInfo }},
                { new: true }
            );
            
            // 更新比赛的动态状态
            return schedule ? this.updateDynamicMatchStatuses(schedule) : null;
        } catch (error) {
            throw new Error(`更新淘汰信息失败: ${error}`);
        }
    }

    /**
     * 添加比赛到赛程
     * @param scheduleId 赛程ID
     * @param date 日期
     * @param matchData 比赛数据
     * @returns 更新后的赛程对象
     */
    static async addMatchToSchedule(
        scheduleId: string, date: string, matchData: Partial<MatchInfo>
    ): Promise<IContestSchedule | null> {
        try {
            const schedule = await ContestScheduleModel.findById(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            
            // 获取比赛版型，默认为"经典版"
            const matchVersion = matchData.edition || "经典版";
            
            // 计算日期对应的星期几（1-7，1代表周一，7代表周日）
            const dateObj = new Date(date);
            let weekDay = dateObj.getDay();
            weekDay = weekDay === 0 ? 7 : weekDay; // 将周日(0)转换为7
            
            // 验证版型在当天是否开放
            const edition = werewolfEditions.get(matchVersion);
            if (!edition) {
                throw new Error(`无效的版型: ${matchVersion}`);
            }
            
            // 检查版型的openDay数组中是否包含该星期几
            if (!edition.openDay.includes(weekDay)) {
                throw new Error(`版型 ${matchVersion} 在星期${weekDay}不开放`);
            }
            
            let dailySchedule = schedule.schedule.find((item: DailySchedule) => item.date === date);
            if (!dailySchedule) {
                dailySchedule = { date, matches: [] };
                schedule.schedule.push(dailySchedule);
            }
            
            dailySchedule.matches.push({
                matchId: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: "scheduled", // 默认状态
                edition: matchVersion, // 使用验证后的版型
                ...matchData
            } as MatchInfo);
            
            const savedSchedule = await schedule.save();
            
            // 更新比赛的动态状态
            return this.updateDynamicMatchStatuses(savedSchedule);
        } catch (error) {
            throw new Error(`添加比赛到赛程失败: ${error}`);
        }
    }

    /**
     * 更新比赛信息
     * @param scheduleId 赛程ID
     * @param date 日期
     * @param matchId 比赛ID
     * @param matchData 比赛数据
     * @returns 更新后的赛程对象
     */
    static async updateMatchInfo(
        scheduleId: string, date: string, matchId: string, matchData: Partial<MatchInfo>
    ): Promise<IContestSchedule | null> {
        try {
            const schedule = await ContestScheduleModel.findById(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            const dailySchedule = schedule.schedule.find((item: DailySchedule) => item.date === date);
            if (!dailySchedule) {
                throw new Error("当日赛程不存在");
            }
            const match = dailySchedule.matches.find((item: MatchInfo) => item.matchId === matchId);
            if (!match) {
                throw new Error("比赛不存在");
            }
            
            // 如果更新了版型，需要验证版型在当天是否开放
            if (matchData.edition) {
                const matchVersion = matchData.edition;
                // 计算日期对应的星期几（1-7，1代表周一，7代表周日）
                const dateObj = new Date(date);
                let weekDay = dateObj.getDay();
                weekDay = weekDay === 0 ? 7 : weekDay;
                
                // 验证版型在当天是否开放
                const edition = werewolfEditions.get(matchVersion);
                if (!edition) {
                    throw new Error(`无效的版型: ${matchVersion}`);
                }
                
                // 检查版型的openDay数组中是否包含该星期几
                if (!edition.openDay.includes(weekDay)) {
                    throw new Error(`版型 ${matchVersion} 在星期${weekDay}不开放`);
                }
            }
            
            // 更新比赛信息
            Object.assign(match, matchData);
            
            const savedSchedule = await schedule.save();
            
            // 更新比赛的动态状态
            return this.updateDynamicMatchStatuses(savedSchedule);
        } catch (error) {
            throw new Error(`更新比赛信息失败: ${error}`);
        }
    }

    /**
     * 更新比赛状态
     * @param scheduleId 赛程ID
     * @param date 日期
     * @param matchId 比赛ID
     * @param status 状态
     * @returns 更新后的赛程对象
     */
    static async updateMatchStatus(
        scheduleId: string, date: string, matchId: string, status: "scheduled" | "in_progress" | "completed" | "cancelled"
    ): Promise<IContestSchedule | null> {
        try {
            // 复用updateMatchInfo方法来更新比赛状态
            return await this.updateMatchInfo(scheduleId, date, matchId, { status });
        } catch (error) {
            throw new Error(`更新比赛状态失败: ${error}`);
        }
    }

    /**
     * 删除赛程
     * @param scheduleId 赛程ID
     * @returns 是否删除成功
     */
    static async deleteSchedule(scheduleId: string): Promise<boolean> {
        try {
            const result = await ContestScheduleModel.findByIdAndDelete(scheduleId);
            return result !== null;
        } catch (error) {
            throw new Error(`删除赛程失败: ${error}`);
        }
    }

    /**
     * 根据日期获取赛程
     * @param scheduleId 赛程ID
     * @param date 日期
     * @returns 当日赛程
     */
    static async getScheduleByDate(scheduleId:string, date: string): Promise<DailySchedule | null> {
        try {
            const schedule = await ContestScheduleModel.findById(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            
            const dailySchedule = schedule.schedule.find((item: DailySchedule) => item.date === date) || null;
            if (dailySchedule) {
                // 更新该日所有比赛的动态状态
                for (const match of dailySchedule.matches) {
                    match.status = ContestAutoStatusUpdateService.getDynamicMatchStatus(match, date);
                }
            }
            
            return dailySchedule;
        } catch (error) {
            throw new Error(`根据日期获取赛程失败: ${error}`);
        }
    }

    /**
     * 计算晋级队伍数量
     * @param scheduleId 赛程ID
     * @returns 晋级队伍数量
     */
    static async calculatePromotedTeams(scheduleId: string): Promise<number> {
        try {
            const schedule = await ContestScheduleModel.findById(scheduleId);
            if (!schedule) {
                throw new Error("赛程不存在");
            }
            const { eliminationInfo, participatingTeamsCount } = schedule;
            let promotedCount = 0;
            
            if (eliminationInfo) {
                if (eliminationInfo.baseMultiple && eliminationInfo.ratio) {
                    const baseCount = Math.ceil(participatingTeamsCount / eliminationInfo.baseMultiple) * eliminationInfo.baseMultiple;
                    promotedCount = Math.ceil(baseCount * eliminationInfo.ratio);
                } else if (eliminationInfo.toRank) {
                    promotedCount = eliminationInfo.toRank;
                }
            }
            
            return promotedCount;
        } catch (error) {
            throw new Error(`计算晋级队伍数量失败: ${error}`);
        }
    }

    /**
     * 根据赛事对象获取当天的赛程安排
     * @param contest 赛事对象
     * @returns 当天的赛程安排
     */
    static async getScheduleByContestDay(contest: any): Promise<any> {
        try {
            if (!contest) {
                throw new Error("赛事数据不存在");
            }
            
            // 获取当前日期
            const today = new Date().toISOString().split("T")[0];
            
            // 从赛事对象中获取contestId
            const contestId = contest.contestId || contest.contest_id;
            if (!contestId) {
                throw new Error("赛事数据中缺少赛事ID");
            }
            
            // 获取该赛事的所有赛程
            const schedules = await this.getScheduleByContestId(contestId);
            
            // 查找当天的赛程安排
            const todaySchedule = schedules.find(schedule => {
                // 遍历赛程中的每天安排，查找今天的日期
                return schedule.schedule.some(dailySchedule => dailySchedule.date === today);
            });
            
            if (!todaySchedule) {
                return null;
            }
            
            // 提取当天的具体赛程
            const todaySpecificSchedule = todaySchedule.schedule.find((dailySchedule: DailySchedule) => dailySchedule.date === today);
            
            return todaySpecificSchedule || null;
        } catch (error) {
            throw new Error(`获取当天赛程安排失败: ${error}`);
        }
    }

    /**
     * 获取当天的流程安排（示例数据）
     * @returns 当天的流程安排，包含时间、流程和说明
     */
    static async getTodayFlow(): Promise<Array<{ time: string; flow: string; description: string }>> {
        try {
            // 返回示例的当天流程安排
            return [
                { time: "17:00", flow: "加入群组时间", description: "队伍需要在此时间前加入比赛群组" },
                { time: "17:30-18:00", flow: "签到时间", description: "队伍需要在这个时间段内完成签到" },
                { time: "18:30-18:50", flow: "进入房间时间", description: "队伍需要在这个时间段内进入指定比赛房间" },
                { time: "19:00", flow: "比赛开始时间", description: "比赛正式开始" }
            ];
        } catch (error) {
            throw new Error(`获取当天流程安排失败: ${error}`);
        }
    }

    /**
     * 获取参赛队伍数量
     * @param scheduleId 赛程ID
     * @returns 参赛队伍数量
     */
    static async getParticipatingTeamsCount(scheduleId: string): Promise<number> {
        try {
            const schedule = await ContestScheduleModel.findById(scheduleId);
            return schedule?.participatingTeamsCount || 0;
        } catch (error) {
            throw new Error(`获取参赛队伍数量失败: ${error}`);
        }
    }

    /**
     * 更新参赛队伍数量
     * @param scheduleId 赛程ID
     * @param count 队伍数量
     * @returns 更新后的赛程对象
     */
    static async updateParticipatingTeamsCount(scheduleId: string, count: number): Promise<IContestSchedule | null> {
        try {
            return await ContestScheduleModel.findByIdAndUpdate(
                scheduleId,
                { $set: { participatingTeamsCount: count }},
                { new: true }
            );
        } catch (error) {
            throw new Error(`更新参赛队伍数量失败: ${error}`);
        }
    }
}