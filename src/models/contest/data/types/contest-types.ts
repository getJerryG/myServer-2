// ------------------------------ 竞赛类型定义 ------------------------------
/** 竞赛状态类型 */
export type ContestStatus = 0 | 1 | 2 | 3 | 4 | 5;

/** 竞赛奖励接口 */
export interface ContestReward {
    item: number;
    reward: string;
}

/** 竞赛报名接口 */
export interface ContestSignUp {
    registrationFee: number;
    deposit: number;
}

/** 状态历史记录接口 */
export interface StatusHistory {
    status: ContestStatus;
    changeTime: Date;
    operator: string;
    description: string;
}

/** 淘汰规则接口 */
export interface EliminationRule {
    stage: string;
    mode: "ratio" | "fixed";
    ratio?: number;
    from?: number;
    to?: number;
    baseMultiple?: number; // 基础倍数
}

/** 竞赛排名接口 */
export interface ContestRanking {
    teamId: string;
    teamName: string;
    clanId: string;
    score: number;
    rank: number;
    promotionStatus: "pending" | "promoted" | "eliminated";
    mvpCount: number;
    svpCount: number;
    wolfWinCount: number;
    godWinCount: number;
    civilianWinCount: number;
}

/** 竞赛管理员接口 */
export interface ContestAdmin {
    userId: string;
    username: string;
    role: "creator" | "admin";
    createdAt: Date;
    permissions: {
        view: boolean;
        edit: boolean;
        submitData: boolean;
        manageAdmins: boolean;
    };
}

/** 竞赛公示阶段接口 */
export interface ContestPublicityStage {
    stageId: string;
    stageName: string;
    auditStartTime: Date;
    auditEndTime: Date;
    publicityStartTime: Date;
    publicityEndTime: Date;
    status: "pending" | "auditing" | "publicity" | "completed";
    isDataSubmitted: boolean;
    submittedBy?: string;
    submittedAt?: Date;
}

/** 竞赛数据接口 */
export interface ContestData {
    name: string;
    rule?: string;
    type?: string;
    playerAllocation?: Record<string, unknown>;
    contestIntroduction?: string;
    contestReward: ContestReward[];
    contestSignUp: ContestSignUp;
    contestSchedule: Record<string, unknown>[];
    contestDay?: Record<string, unknown>;
    maxSignTeams?: number; // 最大报名队伍数
    creatorId: string; // 创建者ID
    creatorNam: string; // 创建者名称
    clanId?: string; // 公会ID
}

/** 排名类型 */
export type RankingType = "auto" | "manual";

/** 日期查找类型 */
export type IfindDate = "today" | "tomorrow" | `${number}-${number}-${number}`;
