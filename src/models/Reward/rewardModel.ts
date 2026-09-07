import { Schema, model } from "mongoose";
import { RewardType, RewardStatus } from "@/data/Reward-enum";
import type { IRewardRecord, IRewardStat } from "~/Reward";

// 奖励记录 schema
const rewardRecordSchema = new Schema<IRewardRecord>(
    {
        user_id: { type: Schema.Types.ObjectId, required: false, ref: "Users" }, // 用户ID
        admin_id: { type: Schema.Types.ObjectId, ref: "Users" }, // 管理员ID
        type: { type: String, enum: Object.values(RewardType), required: true }, // 奖励类型
        amount: { type: Number, required: true }, // 奖励金额
        reason: { type: String, required: false }, // 奖励原因
        status: { type: String, enum: Object.values(RewardStatus), default: RewardStatus.UNISSUED }, // 奖励状态
    },
    {
        versionKey: false,
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            }
        }
    }
);

// 奖励统计 schema
const rewardStatSchema = new Schema<IRewardStat>(
    {
        type: { type: String, enum: Object.values(RewardType), required: true }, // 奖励类型
        total_amount: { type: Number, default: 0 }, // 总金额
        user_count: { type: Number, default: 0 }, // 用户数量
        last_update: { type: Date, default: Date.now }, // 最后更新时间
    },
    { versionKey: false }
);

export const RewardRecord = model<IRewardRecord>("RewardRecord", rewardRecordSchema);
export const RewardStat = model<IRewardStat>("RewardStat", rewardStatSchema);
