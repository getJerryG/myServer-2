import createContestSchedule, { ContestSchedule, IContestSchedule, Schedule } from "./ContestSchedule";
import ContestDay, { ContestDayData } from "./ContestDay";
import * as schedule from "node-schedule";

import Team, { PlayerAllocation } from "../../Team";

import {
    ContestReward,
    ContestSignUp,
    EliminationRule,
    ContestRanking,
    ContestAdmin,
    ContestData as IContestData,
    IfindDate 
} from "./types/contest-types";

import { StatusManager } from "./utils/status-manager";
import { CacheManager } from "./utils/cache-manager";
import { RankingManager } from "./utils/ranking-manager";
import { AdminManager } from "./utils/admin-manager";
import { PublicityManager } from "./utils/publicity-manager";

export interface ContestData extends IContestData {
    playerAllocation?: PlayerAllocation;
    contestSchedule: IContestSchedule[];
    contestDay?: ContestDayData;
}

export default class Contest {
    static id = 0;
    id: number;
    name: string;
    type: string;
    rule: string;
    playerAllocation: PlayerAllocation;
    contestIntroduction: string;
    contestReward: ContestReward[];
    contestSignUp: ContestSignUp;
    contestSchedule: {
        startDay: string;
        endDay: string;
        schedule: ContestSchedule[];
        all: Schedule[];
    };
    
    contestDay: ContestDay | null;
    maxSignTeams: number;
    signTeams: Set<Team>;
    creatorId: string;
    creatorName: string;
    clanId?: string;
    eliminationRules: EliminationRule[];

    private statusManager: StatusManager;
    private cacheManager: CacheManager;
    private rankingManager: RankingManager;
    private adminManager: AdminManager;
    private publicityManager: PublicityManager;

    constructor(data: ContestData) {
        this.id = Contest.id++;
        this.name = data.name;
        this.type = data.type || "";
        this.rule = data.rule || "";
        this.playerAllocation = data.playerAllocation || {
            leader: 1,
            officialMember: 6,
            substitutes: 3,
        };
        this.contestIntroduction = data.contestIntroduction || this.name;
        this.contestReward = data.contestReward;
        this.contestSignUp = data.contestSignUp;
        this.contestSchedule = createContestSchedule(data.contestSchedule);
        this.contestDay = data.contestDay ? new ContestDay(data.contestDay) : null;
        this.signTeams = new Set();
        this.maxSignTeams = data.maxSignTeams || 48;
        this.creatorId = data.creatorId;
        this.creatorName = data.creatorName;
        this.clanId = data.clanId;
        this.eliminationRules = [];

        this.statusManager = new StatusManager(0, this.id, this.name);
        this.cacheManager = new CacheManager(this.id);
        this.rankingManager = new RankingManager();
        this.adminManager = new AdminManager(data.creatorId, data.creatorName);
        this.publicityManager = new PublicityManager(this.contestSchedule.schedule);

        this.setupAutoTrigger();
        this.cacheBasicInfo();
    }

    /**
     * 缓存基本信息
     */
    private async cacheBasicInfo() {
        const basicInfo = {
            id: this.id,
            name: this.name,
            type: this.type,
            rule: this.rule,
            status: this.statusManager.status,
            contestSchedule: this.contestSchedule,
            maxSignTeams: this.maxSignTeams,
            currentSignTeams: this.signTeams.size,
        };
        await this.cacheManager.cacheBasicInfo(basicInfo);
    }

    /**
     * 设置自动触发任务
     */
    private setupAutoTrigger() {
        // 自动开放报名
        if (this.contestSchedule.startDay) {
            const startDate = new Date(this.contestSchedule.startDay);
            schedule.scheduleJob(startDate, () => {
                this.statusManager.openRegistration("system", () => this.cacheBasicInfo());
            });
        }

        // 自动开始竞赛
        const contestStartDate = new Date(this.contestSchedule.startDay);
        contestStartDate.setHours(0, 0, 0, 0);
        schedule.scheduleJob(contestStartDate, () => {
            this.statusManager.start(() => this.cacheBasicInfo());
        });

        // 自动结束竞赛
        const contestEndDate = new Date(this.contestSchedule.endDay);
        contestEndDate.setHours(23, 59, 59, 999);
        schedule.scheduleJob(contestEndDate, () => {
            this.statusManager.end(() => this.cacheBasicInfo(), () => this.rankingManager.autoRank(this.signTeams));
        });
    }

    /**
     * 获取基本信息
     */
    getBasicInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            rule: this.rule,
            status: this.statusManager.status,
            statusDescription: this.statusManager.getStatusDescription(this.statusManager.status),
            statusHistory: this.statusManager.getStatusHistory(),
            contestSchedule: this.contestSchedule,
            maxSignTeams: this.maxSignTeams,
            currentSignTeams: this.signTeams.size,
            contestIntroduction: this.contestIntroduction,
            contestReward: this.contestReward,
            contestSignUp: this.contestSignUp,
            creatorId: this.creatorId,
            creatorName: this.creatorName,
            clanId: this.clanId,
        };
    }

    /**
     * 获取完整信息
     */
    getAllInfo() {
        return {
            ...this.getBasicInfo(),
            eliminationRules: this.eliminationRules,
            signTeams: Array.from(this.signTeams).map(team => team.getBasicInfo()),
            ranking: this.rankingManager.getRanking(),
            rankingType: this.rankingManager.getRankingType(),
            rankingUpdatedAt: this.rankingManager.getRankingUpdatedAt(),
            publicityStages: this.publicityManager.getPublicityStages(),
        };
    }

    /**
     * 添加报名队伍
     * @param team 队伍
     */
    addSignTeam(team: Team) {
        if (this.signTeams.size >= this.maxSignTeams) {
            throw new Error("报名队伍已满");
        }
        this.signTeams.add(team);
        this.cacheManager.cacheSignTeams(this.signTeams);
    }

    /**
     * 移除报名队伍
     * @param team 队伍
     */
    removeSignTeam(team: Team) {
        this.signTeams.delete(team);
        this.cacheManager.cacheSignTeams(this.signTeams);
    }

    /**
     * 获取队伍
     * @param teamId 队伍ID
     */
    getTeam(teamId: string): Team | undefined {
        return Array.from(this.signTeams).find(team => team.id === teamId);
    }

    /**
     * 提交审核
     * @param operator 操作者
     */
    submit(operator: string) {
        this.statusManager.submit(operator, () => this.cacheBasicInfo());
    }

    /**
     * 发布
     * @param operator 操作者
     */
    publish(operator: string) {
        this.statusManager.publish(operator, () => this.cacheBasicInfo());
    }

    /**
     * 开放报名
     * @param operator 操作者
     */
    openRegistration(operator: string) {
        this.statusManager.openRegistration(operator, () => this.cacheBasicInfo());
    }

    /**
     * 判断是否为管理员
     * @param userId 用户ID
     */
    isAdmin(userId: string): boolean {
        return this.adminManager.isAdmin(userId);
    }

    /**
     * 判断是否有权限
     * @param userId 用户ID
     * @param permission 权限类型
     */
    hasPermission(
        userId: string,
        permission: keyof ContestAdmin["permissions"]
    ): boolean {
        return this.adminManager.hasPermission(userId, permission);
    }

    /**
     * 判断是否可以查看敏感信息
     * @param userId 用户ID
     * @param teamId 队伍ID
     */
    canViewSensitiveInfo(userId: string, teamId?: string): boolean {
        if (this.isAdmin(userId)) {
            return true;
        }
        if (userId === this.creatorId) {
            return true;
        }
        if (this.adminManager.isAdmin(userId)) {
            return true;
        }
        if (teamId) {
            const team = this.getTeam(teamId);
            if (team) {
                if (team.leader === userId) {
                    return true;
                }
                const member = [...team.members.values()].find(
                    (member) => member.nickName === userId
                );
                if (member) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 添加管理员
     * @param adminData 管理员数据
     * @param operator 操作者
     */
    addAdmin(adminData: Omit<ContestAdmin, "createdAt">, operator: string): void {
        this.adminManager.addAdmin(adminData, operator);
    }

    /**
     * 移除管理员
     * @param userId 用户ID
     * @param operator 操作者
     */
    removeAdmin(userId: string, operator: string): void {
        this.adminManager.removeAdmin(userId, operator);
    }

    /**
     * 更新管理员权限
     * @param userId 用户ID
     * @param permissions 权限
     * @param operator 操作者
     */
    updateAdminPermissions(userId: string, permissions: Partial<ContestAdmin["permissions"]>, operator: string): void {
        this.adminManager.updateAdminPermissions(userId, permissions, operator);
    }

    /**
     * 提交阶段数据
     * @param stageId 阶段ID
     * @param submittedBy 提交者
     */
    submitStageData(stageId: string, submittedBy: string): void {
        this.publicityManager.submitStageData(stageId, submittedBy);
    }

    /**
     * 判断是否处于公示期
     */
    isPublicityPeriod(): boolean {
        return this.publicityManager.isPublicityPeriod();
    }

    /**
     * 获取用户排名
     * @param userId 用户ID
     * @param teamId 队伍ID
     */
    getRankingForUser(userId: string, teamId?: string): ContestRanking[] {
        const ranking = this.rankingManager.getRanking();
        if (teamId) {
            return ranking.filter((rank) => rank.teamId === teamId);
        }
        return ranking;
    }

    /**
     * 获取用户队伍记录
     * @param userId 用户ID
     * @param teamId 队伍ID
     */
    getTeamRecordsForUser(userId: string, teamId: string): Record<string, unknown> {
        const team = this.getTeam(teamId);
        if (!team) {
            throw new Error("队伍不存在");
        }
        return team.records;
    }

    /**
     * 根据日期获取赛程
     * @param date 日期
     */
    getScheduleByDate(date: IfindDate): Schedule | null {
        const allSchedules = this.contestSchedule.all;
        let targetDate = date;

        if (date === "today") {
            targetDate = new Date().toISOString().split("T")[0] as IfindDate;
        } else if (date === "tomorrow") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDate = tomorrow.toISOString().split("T")[0] as IfindDate;
        }

        return allSchedules.find((s) => s.date === targetDate) || null;
    }

    /**
     * 获取轮数
     */
    get roundCount(): number {
        return this.contestSchedule.schedule.length;
    }

    /**
     * 获取日期数量
     * @param round 轮次
     */
    dateCount(round: number): number {
        if (round < 1 || round > this.contestSchedule.schedule.length) {
            throw new Error("轮次无效");
        }
        return this.contestSchedule.schedule[round - 1].dateCount;
    }
}
