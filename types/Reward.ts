import { Document, Schema } from "mongoose";
import { RewardType, RewardStatus } from "@/data/Reward-enum";

/**
 * 奖励记录接口
 */
export interface IRewardRecord extends Document {
    user_id: Schema.Types.ObjectId;
    admin_id?: Schema.Types.ObjectId;
    type: RewardType;
    amount: number;
    reason?: string;
    status: RewardStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 奖励统计接口
 */
export interface IRewardStat extends Document {
    type: RewardType;
    total_amount: number;
    user_count: number;
    last_update: Date;
}
