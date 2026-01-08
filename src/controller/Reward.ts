import { Schema, model } from "mongoose";

// 奖励类型枚举
export enum RewardType {
    POINTS = "points",
    CURRENCY = "currency",
    CARD = "card",
    MEMBER_EXP = "member_exp",
    PLAYER_EXP = "player_exp"
}

// 奖励记录模式
const rewardRecordSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        admin_id: {
            type: Schema.Types.ObjectId
        }, // 发放奖励的管理员ID
        type: {
            type: String,
            enum: Object.values(RewardType),
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        related_code: {
            type: String
        }, // 相关业务码
        created_at: {
            type: Date,
            default: Date.now
        }
    },
    { versionKey: false }
);

// 奖励统计模式
const rewardStatSchema = new Schema(
    {
        type: {
            type: String,
            enum: Object.values(RewardType),
            required: true
        },
        total_amount: {
            type: Number,
            default: 0
        },
        user_count: {
            type: Number,
            default: 0
        },
        last_update: {
            type: Date,
            default: Date.now
        }
    },
    { versionKey: false }
);

// 导出模型
export const RewardRecord = model("RewardRecord", rewardRecordSchema);
export const RewardStat = model("RewardStat", rewardStatSchema);