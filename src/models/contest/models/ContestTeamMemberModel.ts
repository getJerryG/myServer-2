import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IContestTeamMember } from "../types/contest";

// 竞赛队伍成员Schema
const contestTeamMemberSchema = new Schema<IContestTeamMember>(
    {
        contestId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Contests"
        },
        scheduleId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "ContestSchedules"
        },
        registrationId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "ContestTeamRegistrations"
        },
        matchId: {
            type: String,
            required: true
        },
        userId: {
            type: Number,
            required: true,
            ref: "Users"
        },
        nickName: {
            type: String,
            required: true,
            default: ""
        },
        status: {
            type: String,
            required: true,
            enum: ["scheduled", "completed", "absent"],
            default: "scheduled"
        },
        score: {
            type: Number,
            required: true,
            default: 0
        },
        honor: {
            type: String,
            required: false,
            default: ""
        },
        isWin: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    option
);

// 索引配置
contestTeamMemberSchema.index({ contestId: 1 }, { name: "member_contestId_index" });
contestTeamMemberSchema.index({ scheduleId: 1 }, { name: "member_scheduleId_index" });
contestTeamMemberSchema.index({ registrationId: 1 }, { name: "member_registrationId_index" });
contestTeamMemberSchema.index({ userId: 1 }, { name: "member_userId_index" });
contestTeamMemberSchema.index({ contestId: 1, userId: 1 }, { name: "member_contest_user_index" });
contestTeamMemberSchema.index({ scheduleId: 1, matchId: 1 }, { name: "member_schedule_match_index" });
contestTeamMemberSchema.index({ status: 1 }, { name: "member_status_index" });

// 静态方法
contestTeamMemberSchema.statics.getMembersByContest = async function (contestId: string) {
    return await this.find({ contestId });
};

contestTeamMemberSchema.statics.getMembersBySchedule = async function (scheduleId: string) {
    return await this.find({ scheduleId });
};

contestTeamMemberSchema.statics.getMembersByRegistration = async function (registrationId: string) {
    return await this.find({ registrationId });
};

contestTeamMemberSchema.statics.getMemberByContestAndUser = async function (contestId: string, userId: number) {
    return await this.find({ contestId, userId });
};

contestTeamMemberSchema.statics.getMembersByMatch = async function (scheduleId: string, matchId: string) {
    return await this.find({ scheduleId, matchId });
};

// 竞赛队伍成员模型
const ContestTeamMemberModel: Model<IContestTeamMember> = mongoose.model<IContestTeamMember>(
    "ContestTeamMembers",
    contestTeamMemberSchema,
    "contest_team_members"
);

export default ContestTeamMemberModel;
