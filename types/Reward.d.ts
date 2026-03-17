import { Document, Schema } from "mongoose";

/**
 * 奖励记录接口
 */
export interface IRewardRecord extends Document {
    userId: Schema.Types.ObjectId;
    rewardType: string;
    rewardContent: string;
    amount: number;
    status: number;
    createTime: Date;
    updateTime: Date;
}

/**
 * 奖励统计接口
 */
export interface IRewardStat extends Document {
    userId: Schema.Types.ObjectId;
    totalRewards: number;
    totalAmount: number;
    lastRewardTime: Date;
    createTime: Date;
    updateTime: Date;
}
