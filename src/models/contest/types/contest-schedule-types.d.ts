import { Document } from "mongoose";
import { EliminationMode } from "./contest-base-types";

// 比赛信息接口
export interface MatchInfo {
    matchId: string;          // 比赛ID
    time: string;             // 比赛时间
    requiredPlayers: number;  // 所需玩家数
    status: "scheduled" | "in_progress" | "completed" | "cancelled"; // 比赛状态
    room: string;             // 房间号/比赛房间
    edition: string;          // 版型（如：标准场、赤月猎魔人等）
}

// 每日赛程接口
export interface DailySchedule {
    date: string;             // 日期
    matches: MatchInfo[];     // 当天的比赛列表
}

// 淘汰规则接口
export interface EliminationInfo {
    mode: EliminationMode;        // 淘汰模式
    ratio?: number;               // 淘汰比例
    baseMultiple?: number;        // 基础倍数
    fromRank?: number;            // 起始排名
    toRank?: number;              // 结束排名
    description: string;          // 描述
}


export interface IContestSchedule extends Document {
    contest_id: number;
    roundName: string;
    roundOrder: number;
    startDate: Date;
    endDate: Date;
    participatingTeamsCount: number;
    promotedTeamsCount: number;
    eliminationInfo: EliminationInfo;
    schedule: DailySchedule[];
    createTime: Date;
    updateTime: Date;
}

export type ContestScheduleCreateType = Partial<Pick<
    IContestSchedule,
    "roundName" | "roundOrder" | "startDate" | "endDate" | "participatingTeamsCount" | "promotedTeamsCount" | "eliminationInfo" | "schedule"
>>;
