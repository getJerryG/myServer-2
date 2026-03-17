import mongoose, { Schema, Model } from "mongoose";
import option from "../../../db/model/option";
import AutoIncrementFactory from "mongoose-sequence";
import { IContest } from "../types/contest";

// 初始化自动增长插件
const AutoIncrement = AutoIncrementFactory(mongoose as Parameters<typeof AutoIncrementFactory>[0]);

/**
 * 竞赛模型Schema
 */
const contestSchema = new Schema<IContest>(
    {
        contestId: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true,
            default: ""
        },
        type: {
            type: String,
            required: true,
            enum: ["individual", "team"],
            default: "team"
        },
        rule: {
            type: String,
            required: true,
            enum: ["elimination", "round_robin"],
            default: "elimination"
        },
        status: {
            type: Number,
            required: true,
            enum: [0, 1, 2, 3, 4, 5],
            default: 0 // 0: 未开始, 1: 报名中, 2: 进行中, 3: 已结束, 4: 已取消, 5: 已删除
        },
        startDay: {
            type: Date,
            required: true
        },
        endDay: {
            type: Date,
            required: true
        },
        contestIntroduction: {
            type: String,
            required: false,
            default: ""
        },
        maxSignTeams: {
            type: Number,
            required: true,
            default: 48
        },
        creatorId: {
            type: String,
            required: true,
            default: ""
        },
        creatorName: {
            type: String,
            required: true,
            default: ""
        },
        clanId: {
            type: String,
            required: false
        },
        currentSignTeams: {
            type: Number,
            required: true,
            default: 0
        },
        registrationType: {
            type: String,
            required: true,
            enum: ["free", "paid"],
            default: "free"
        }
    },
    option
);

// 创建索引
contestSchema.index({ contestId: 1 }, { unique: true, name: "contestId_unique_index" });
contestSchema.index({ name: 1 }, { unique: true, name: "contest_name_unique_index" });
contestSchema.index({ status: 1 }, { name: "contest_status_index" });
contestSchema.index({ startDay: 1 }, { name: "contest_startDay_index" });
contestSchema.index({ endDay: 1 }, { name: "contest_endDay_index" });
contestSchema.index({ createdAt: 1 }, { name: "contest_createTime_index" });
contestSchema.index({ updatedAt: 1 }, { name: "contest_updateTime_index" });

// 添加自动增长插件
contestSchema.plugin(AutoIncrement, { inc_field: "contestId" });

// 静态方法
contestSchema.statics.getContestById = async function (contestId: number) {
    return await this.findOne({ contestId });
};

contestSchema.statics.getContestsByStatus = async function (status: number) {
    return await this.find({ status });
};

contestSchema.statics.getActiveContests = async function () {
    return await this.find({ status: { $in: [2, 3, 4] } });
};

// 创建并导出模型
const ContestModel: Model<IContest> = mongoose.model<IContest>("Contests", contestSchema, "contests");

export default ContestModel;