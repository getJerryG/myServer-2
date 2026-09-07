import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IPlayerResult } from "../types/contest-player-result-types";

const playerResultSchema = new Schema<IPlayerResult>(
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
            required: true,
            default: ""
        },
        teamName: {
            type: String,
            required: true,
            default: ""
        },
        userId: {
            type: Number,
            required: true,
            ref: "Users"
        },
        nickname: {
            type: String,
            required: true,
            default: ""
        },
        score: {
            type: Number,
            required: true,
            default: 0
        },
        role: {
            type: String,
            required: false,
            default: ""
        },
        faction: {
            type: String,
            required: false,
            default: ""
        },
        isMvp: {
            type: Boolean,
            required: true,
            default: false
        },
        isSvp: {
            type: Boolean,
            required: true,
            default: false
        },
        isWin: {
            type: Boolean,
            required: true,
            default: false
        },
        honor: {
            type: String,
            required: false,
            default: ""
        }
    },
    option
);

playerResultSchema.index({ contestId: 1 }, { name: "playerResult_contestId_index" });
playerResultSchema.index({ scheduleId: 1 }, { name: "playerResult_scheduleId_index" });
playerResultSchema.index({ registrationId: 1 }, { name: "playerResult_registrationId_index" });
playerResultSchema.index({ matchId: 1 }, { name: "playerResult_matchId_index" });
playerResultSchema.index({ userId: 1 }, { name: "playerResult_userId_index" });
playerResultSchema.index(
    { contestId: 1, scheduleId: 1, teamName: 1 }, 
    { name: "playerResult_contest_schedule_team_index" }
);
playerResultSchema.index({ contestId: 1, userId: 1 }, { name: "playerResult_contest_user_index" });

playerResultSchema.statics.getPlayerResultsByMatch = async function (
    contestId: string, 
    scheduleId: string, 
    teamName: string
) {
    return await this.find({ contestId, scheduleId, teamName });
};

playerResultSchema.statics.getPlayerResultsByUser = async function (
    contestId: string, 
    userId: number
) {
    return await this.find({ contestId, userId }).sort({ createdAt: -1 });
};

playerResultSchema.statics.getPlayerResultsBySchedule = async function (
    contestId: string, 
    scheduleId: string
) {
    return await this.find({ contestId, scheduleId });
};

playerResultSchema.statics.deletePlayerResultsByMatch = async function (
    contestId: string, 
    scheduleId: string, 
    teamName: string
) {
    return await this.deleteMany({ contestId, scheduleId, teamName });
};

const ContestPlayerResultModel: Model<IPlayerResult> = mongoose.model<IPlayerResult>(
    "ContestPlayerResults",
    playerResultSchema,
    "contest_player_results"
);

export default ContestPlayerResultModel;
