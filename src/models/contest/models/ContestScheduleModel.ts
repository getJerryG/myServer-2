import mongoose, { Schema, Model } from "mongoose";
import option from "../../../db/model/option";
import { IContestSchedule } from "../types/contest";

/**
 * 竞赛赛程模型接口，包含静态方法
 */
interface IContestScheduleModel extends Model<IContestSchedule> {
    getScheduleByContestId(contest_id: number): Promise<IContestSchedule[]>;
    getScheduleByRoundOrder(contest_id: number, roundOrder: number): Promise<IContestSchedule | null>;
    getNextSchedule(contest_id: number, currentRoundOrder: number): Promise<IContestSchedule | null>;
}

/**
 * 竞赛赛程模型Schema
 */
const contestScheduleSchema = new Schema<IContestSchedule>(
    {
        contest_id: {
            type: Number,
            required: true
        },
        roundName: {
            type: String,
            required: true,
            default: ""
        },
        roundOrder: {
            type: Number,
            required: true,
            default: 1
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        participatingTeamsCount: {
            type: Number,
            required: true,
            default: 0
        },
        promotedTeamsCount: {
            type: Number,
            required: true,
            default: 0
        },
        eliminationInfo: {
            type: {
                mode: {
                    type: String,
                    required: true,
                    enum: ["ratio", "fixed"]
                },
                ratio: {
                    type: Number,
                    required: false
                },
                baseMultiple: {
                    type: Number,
                    required: false
                },
                fromRank: {
                    type: Number,
                    required: false
                },
                toRank: {
                    type: Number,
                    required: false
                },
                description: {
                    type: String,
                    required: true,
                    default: ""
                }
            },
            required: true
        },
        schedule: {
            type: [{
                date: {
                    type: String,
                    required: true
                },
                matches: {
                    type: [{
                        matchId: {
                            type: String,
                            required: true
                        },
                        time: {
                            type: String,
                            required: true
                        },
                        requiredPlayers: {
                            type: Number,
                            required: true,
                            default: 1
                        },
                        status: {
                            type: String,
                            required: true,
                            enum: ["scheduled", "in_progress", "completed", "cancelled"],
                            default: "scheduled"
                        },
                        room: {
                            type: String,
                            required: true
                        },
                        edition: {
                            type: String,
                            required: true,
                            default: "标准场"
                        }
                    }],
                    required: true
                }
            }],
            required: true,
            default: []
        }
    },
    option
);

// 创建索引
contestScheduleSchema.index({ contest_id: 1 }, { name: "contestSchedule_contest_id_index" });
contestScheduleSchema.index({ contest_id: 1, roundName: 1 }, { unique: true, name: "contestSchedule_contest_id_roundName_unique_index" });
contestScheduleSchema.index({ roundOrder: 1 }, { name: "contestSchedule_roundOrder_index" });
contestScheduleSchema.index({ startDate: 1 }, { name: "contestSchedule_startDate_index" });
contestScheduleSchema.index({ endDate: 1 }, { name: "contestSchedule_endDate_index" });
contestScheduleSchema.index({ createdAt: 1 }, { name: "contestSchedule_createTime_index" });
contestScheduleSchema.index({ updatedAt: 1 }, { name: "contestSchedule_updateTime_index" });

// 静态方法
contestScheduleSchema.statics.getScheduleByContestId = async function (contest_id: string | mongoose.Types.ObjectId) {
    return await this.find({ contest_id });
};

contestScheduleSchema.statics.getScheduleByRoundOrder = async function(contest_id: string | mongoose.Types.ObjectId, roundOrder: number) {
    return await this.findOne({ contest_id, roundOrder });
};

contestScheduleSchema.statics.getNextSchedule = async function(contest_id: string | mongoose.Types.ObjectId, currentRoundOrder: number) {
    return await this.findOne({ contest_id, roundOrder: currentRoundOrder + 1 });
};

// 创建并导出模型
const ContestScheduleModel = mongoose.model<IContestSchedule, IContestScheduleModel>(
    "ContestSchedules",
    contestScheduleSchema,
    "contest_schedules"
);

export default ContestScheduleModel;