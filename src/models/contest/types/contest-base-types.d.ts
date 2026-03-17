import { Document } from "mongoose";

// ;
export type ContestStatus = 0 | 1 | 2 | 3 | 4 | 5;
//;
export type ContestType = "" | "";
//;
export type RegistrationType = "" | "";
//;
export type ContestRule = "" | "";
//;
export type EliminationMode = "ratio" | "fixed";
//;
export type PromotionStatus = "pending" | "promoted" | "eliminated";
//;
export type RankingType = "auto" | "manual";
// ;
export interface IContest extends Document {
    contestId: number;
    name: string;
    type: ContestType;
    rule: ContestRule;
    status: ContestStatus;
    startDay: Date;
    endDay: Date;
    contestIntroduction: string;
    maxSignTeams: number;
    creatorId: string;
    creatorName: string;
    clanId?: string;
    currentSignTeams: number;
    registrationType: RegistrationType;
    createTime: Date;
    updateTime: Date;
}
