import { Document } from "mongoose";

// 竞赛队伍报名接口
export interface IContestTeamRegistration extends Document {
    contest_id: mongoose.Types.ObjectId;
    teamId: string;
    teamName: string;
    clanId: string;
    leaderId: number;
    registrationTime: Date;
    status: 0 | 1 | 2;
    participatedRounds: string[];
    createTime: Date;
    updateTime: Date;
}

// 竞赛队伍成员接口
export interface IContestTeamMember extends Document {
    contest_id: mongoose.Types.ObjectId;
    schedule_id: mongoose.Types.ObjectId;
    registration_id: mongoose.Types.ObjectId;
    match_id: string;
    userId: number;
    nickName: string;
    status: "scheduled" | "completed" | "absent";
    score: number;
    honor: string;
    isWin: boolean;
    createTime: Date;
    updateTime: Date;
}
