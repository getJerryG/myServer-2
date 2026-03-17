import { ContestPublicityStage } from "../types/contest-types";
import { ContestSchedule } from "../ContestSchedule";

/**
 * 公示管理器
 */
export class PublicityManager {
    private publicityStages: ContestPublicityStage[];

    /**
     * 构造函数
     * @param contestSchedule 竞赛赛程
     */
    constructor(contestSchedule: ContestSchedule[]) {
        // 初始化公示阶段
        this.publicityStages = this.initPublicityStages(contestSchedule);
    }

    /**
     * 初始化公示阶段
     * @param schedule 赛程列表
     * @returns 公示阶段列表
     */
    private initPublicityStages(schedule: ContestSchedule[]): ContestPublicityStage[] {
        const stages: ContestPublicityStage[] = [];

        // 为每个赛程阶段创建公示阶段
        schedule.forEach((scheduleStage, index) => {
            // 审核天数和公示天数
            const auditDays = 2;
            const publicityDays = 3;

            // 计算审核开始时间（赛程结束当天23:59:59）
            const auditStartTime = new Date(scheduleStage.endDay);
            auditStartTime.setHours(23, 59, 59, 999);

            // 计算审核结束时间（审核开始时间 + 审核天数）
            const auditEndTime = new Date(auditStartTime);
            auditEndTime.setDate(auditEndTime.getDate() + auditDays);

            // 计算公示开始时间（审核结束时间 + 1天，00:00:00）
            const publicityStartTime = new Date(auditEndTime);
            publicityStartTime.setHours(0, 0, 0, 0);

            // 计算公示结束时间（公示开始时间 + 公示天数）
            const publicityEndTime = new Date(publicityStartTime);
            publicityEndTime.setDate(publicityEndTime.getDate() + publicityDays);

            stages.push({
                stageId: `stage_${index + 1}`,
                stageName: scheduleStage.name,
                auditStartTime,
                auditEndTime,
                publicityStartTime,
                publicityEndTime,
                status: "pending",
                isDataSubmitted: false
            });
        });

        return stages;
    }

    /**
     * 更新公示阶段状态
     */
    updatePublicityStageStatus(): void {
        const now = new Date();

        this.publicityStages.forEach((stage) => {
            if (now < stage.auditStartTime) {
                stage.status = "pending";
            } else if (now >= stage.auditStartTime && now < stage.auditEndTime) {
                stage.status = "auditing";
            } else if (now >= stage.auditEndTime && now < stage.publicityEndTime) {
                stage.status = "publicity";
            } else if (now >= stage.publicityEndTime) {
                stage.status = "completed";
            }
        });
    }

    /**
     * 判断是否处于公示期
     * @returns 是否处于公示期
     */
    isPublicityPeriod(): boolean {
        this.updatePublicityStageStatus();
        return this.publicityStages.some((stage) => stage.status === "publicity");
    }

    /**
     * 提交阶段数据
     * @param stageId 阶段ID
     * @param submittedBy 提交者
     */
    submitStageData(stageId: string, submittedBy: string): void {
        const stage = this.publicityStages.find((stage) => stage.stageId === stageId);
        if (!stage) {
            throw new Error("未找到该阶段");
        }

        const now = new Date();
        if (now < stage.auditStartTime || now > stage.auditEndTime) {
            throw new Error("当前不在提交数据的时间段内");
        }

        stage.isDataSubmitted = true;
        stage.submittedBy = submittedBy;
        stage.submittedAt = new Date();

        // 更新状态
        this.updatePublicityStageStatus();
    }

    /**
     * 获取公示阶段列表
     * @returns 公示阶段列表
     */
    getPublicityStages(): ContestPublicityStage[] {
        return this.publicityStages;
    }
}
