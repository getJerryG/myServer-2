import ContestModel from "../models/ContestModel";
import ContestScheduleModel from "../models/ContestScheduleModel";
import { IContest } from "../types/contest";
import { IContestSchedule, MatchInfo } from "../types/contest-schedule-types";
import { scheduleJob } from "node-schedule";

/**
 * 赛事自动状态更新服务
 * 用于根据时间自动更新赛事、赛程和比赛状态
 */
export default class ContestAutoStatusUpdateService {
    /**
     * 初始化赛事状态自动更新任务
     */
    static initAutoStatusUpdate() {
        // 每天凌晨1点执行一次完整状态更新
        scheduleJob("0 0 1 * * *", () => {
            this.updateAllStatuses();
        });
        
        // 每小时执行一次状态更新，确保比赛当天状态能及时更新
        scheduleJob("0 * * * *", () => {
            this.updateAllStatuses();
        });
        
        // 立即执行一次，确保状态正确
        this.updateAllStatuses();
    }

    /**
     * 更新所有赛事、赛程和比赛的状态
     */
    static async updateAllStatuses() {
        try {
            console.log("开始执行自动状态更新...");
            
            // 更新所有赛事状态
            await this.updateAllContestsStatus();
            
            // 更新所有赛程和比赛状态
            await this.updateAllSchedulesAndMatchesStatus();
            
            console.log("自动状态更新完成");
        } catch (error) {
            console.error("自动状态更新失败:", error);
        }
    }

    /**
     * 更新所有赛事的状态
     */
    static async updateAllContestsStatus() {
        try {
            const contests = await ContestModel.find();
            const now = new Date();
            
            for (const contest of contests) {
                await this.updateContestStatus(contest, now);
            }
        } catch (error) {
            console.error("更新所有赛事状态失败:", error);
            throw error;
        }
    }

    /**
     * 更新所有赛程和比赛的状态
     */
    static async updateAllSchedulesAndMatchesStatus() {
        try {
            const schedules = await ContestScheduleModel.find();
            const now = new Date();
            
            for (const schedule of schedules) {
                await this.updateScheduleAndMatchesStatus(schedule, now);
            }
        } catch (error) {
            console.error("更新所有赛程和比赛状态失败:", error);
            throw error;
        }
    }

    /**
     * 更新单个赛事的状态
     * @param contest 赛事对象
     * @param now 当前时间
     */
    static async updateContestStatus(contest: IContest, now: Date) {
        const startDay = new Date(contest.startDay);
        const endDay = new Date(contest.endDay);
        endDay.setHours(23, 59, 59, 999); // 设置为当天结束时间
        
        let newStatus = contest.status;
        
        // 根据时间计算新状态
        if (now < startDay) {
            // 未到开始时间，状态为未开始(0)或报名中(1)
            newStatus = 0;
        } else if (now >= startDay && now <= endDay) {
            // 赛事进行中
            newStatus = 2;
        } else if (now > endDay) {
            // 赛事已结束
            newStatus = 3;
        }
        
        // 如果状态发生变化，更新数据库
        if (newStatus !== contest.status) {
            await ContestModel.updateOne(
                { contestId: contest.contestId },
                { $set: { status: newStatus } }
            );
            console.log(`赛事${contest.contestId}状态已更新为${newStatus}`);
        }
    }

    /**
     * 更新单个赛程和其包含的所有比赛的状态
     * @param schedule 赛程对象
     * @param now 当前时间
     */
    static async updateScheduleAndMatchesStatus(schedule: IContestSchedule, now: Date) {
        try {
            let isUpdated = false;
            const updatedSchedule = { ...schedule.toObject() };
            
            // 更新每个比赛的状态
            for (const dailySchedule of updatedSchedule.schedule) {
                for (const match of dailySchedule.matches) {
                    const newMatchStatus = this.calculateMatchStatus(match, dailySchedule.date, now);
                    if (newMatchStatus !== match.status) {
                        match.status = newMatchStatus;
                        isUpdated = true;
                        console.log(`比赛${match.matchId}状态已更新为${newMatchStatus}`);
                    }
                }
            }
            
            // 如果有状态变化，保存到数据库
            if (isUpdated) {
                await ContestScheduleModel.updateOne(
                    { _id: schedule._id },
                    { $set: { schedule: updatedSchedule.schedule } }
                );
            }
        } catch (error) {
            console.error(`更新赛程${schedule._id}状态失败:`, error);
            throw error;
        }
    }

    /**
     * 计算单个比赛的状态
     * @param match 比赛对象
     * @param date 比赛日期
     * @param now 当前时间
     * @returns 计算后的比赛状态
     */
    static calculateMatchStatus(
        match: MatchInfo, 
        date: string, 
        now: Date
    ): "scheduled" | "in_progress" | "completed" | "cancelled" {
        // 结合日期和时间创建完整的比赛时间
        const fullMatchTime = new Date(`${date}T${match.time}`);
        
        // 获取当前日期（不包含时间）
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // 获取比赛日期（不包含时间）
        const matchDate = new Date(fullMatchTime.getFullYear(), fullMatchTime.getMonth(), fullMatchTime.getDate());
        
        // 如果是当天的比赛，状态改为in_progress
        if (currentDate.getTime() === matchDate.getTime()) {
            return "in_progress";
        } else if (now < fullMatchTime) {
            // 比赛未开始
            return "scheduled";
        } else {
            // 比赛已结束
            return "completed";
        }
    }

    /**
     * 动态获取赛事状态（用于查询时动态计算）
     * @param contest 赛事对象
     * @returns 动态计算的赛事状态
     */
    static getDynamicStatus(contest: IContest): number {
        const now = new Date();
        const startDay = new Date(contest.startDay);
        const endDay = new Date(contest.endDay);
        endDay.setHours(23, 59, 59, 999); // 设置为当天结束时间
        
        if (now < startDay) {
            return 0;
        } else if (now >= startDay && now <= endDay) {
            return 2;
        } else if (now > endDay) {
            return 3;
        }
        
        return contest.status;
    }

    /**
     * 动态获取比赛状态（用于查询时动态计算）
     * @param match 比赛对象
     * @param date 比赛日期
     * @returns 动态计算的比赛状态
     */
    static getDynamicMatchStatus(
        match: MatchInfo, 
        date: string
    ): "scheduled" | "in_progress" | "completed" | "cancelled" {
        return this.calculateMatchStatus(match, date, new Date());
    }
}