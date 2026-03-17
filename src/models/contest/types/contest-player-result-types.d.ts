import { Document } from "mongoose";

export interface IPlayerResult extends Document {
    contestId: string;
    scheduleId: string;
    registrationId: string;
    matchId: string;
    teamName: string;
    userId: number;
    nickname: string;
    score: number;
    role: string;
    faction: string;
    isMvp: boolean;
    isSvp: boolean;
    isWin: boolean;
    honor: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPlayerMatchResult {
    userId: number;
    nickname: string;
    score: number;
    role?: string;
    faction?: string;
    isMvp?: boolean;
    isSvp?: boolean;
    isWin?: boolean;
    honor?: string;
}

export interface ITeamMatchResult {
    teamName: string;
    date: string;
    round: number;
    players: IPlayerMatchResult[];
}

export interface IContestPlayerResult extends Document {
    contestId: string;
    teamName: string;
    date: string;
    round: number;
    results: IPlayerMatchResult[];
    operator: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PlayerMatchResultType = {
    userId: number;
    nickname: string;
    score: number;
    role?: string;
    faction?: string;
    isMvp?: boolean;
    isSvp?: boolean;
    isWin?: boolean;
    honor?: string;
};
