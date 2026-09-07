import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IContestRanking } from "../types/contest";

/**
 * 竞赛排名模型Schema
 */
const contestRankingSchema = new Schema<IContestRanking>(
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
        teamId: {
            type: String,
            required: true,
            ref: "Teams"
        },
        teamName: {
            type: String,
            required: true,
            default: ""
        },
        score: {
            type: Number,
            required: true,
            default: 0
        },
        rank: {
            type: Number,
            required: true,
            default: 0
        },
        promotionStatus: {
            type: String,
            required: true,
            enum: ["pending", "promoted", "eliminated"],
            default: "pending"
        },
        nextScheduleId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "ContestSchedules"
        },
        rankingType: {
            type: String,
            required: true,
            enum: ["auto", "manual"],
            default: "auto"
        }
    },
    option
);

// 创建索引
contestRankingSchema.index({ contestId: 1 }, { name: "ranking_contestId_index" });
contestRankingSchema.index({ scheduleId: 1 }, { name: "ranking_scheduleId_index" });
contestRankingSchema.index({ teamId: 1 }, { name: "ranking_teamId_index" });
contestRankingSchema.index({ contestId: 1, scheduleId: 1 }, { name: "ranking_contest_schedule_index" });
contestRankingSchema.index({ contestId: 1, teamId: 1 }, { name: "ranking_contest_team_index" });
contestRankingSchema.index({ scheduleId: 1, rank: 1 }, { name: "ranking_schedule_rank_index" });
contestRankingSchema.index({ promotionStatus: 1 }, { name: "ranking_promotionStatus_index" });

// 静态方法
contestRankingSchema.statics.getRankingsByScheduleId = async function (scheduleId: string) {
    return await this.find({ scheduleId }).sort({ rank: 1 });
};

contestRankingSchema.statics.getRankingByContestAndTeam = async function(contestId: string, teamId: string) {
    return await this.find({ contestId, teamId });
};

contestRankingSchema.statics.getPromotedTeamsBySchedule = async function (scheduleId: string) {
    return await this.find({ scheduleId, promotionStatus: "promoted" }).sort({ rank: 1 });
};

contestRankingSchema.statics.getEliminatedTeamsBySchedule = async function (scheduleId: string) {
    return await this.find({ scheduleId, promotionStatus: "eliminated" });
};

// 创建并导出模型
const ContestRankingModel: Model<IContestRanking> = mongoose.model<IContestRanking>(
    "ContestRankings",
    contestRankingSchema,
    "contest_rankings"
);

export default ContestRankingModel;