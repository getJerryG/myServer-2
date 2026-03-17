import { Document } from "mongoose";
import { PromotionStatus, RankingType } from "./contest-base-types";

// 竞赛排名接口
export interface IContestRanking extends Document {
    contest_id: mongoose.Types.ObjectId;
    schedule_id: mongoose.Types.ObjectId;
    teamId: string;
    teamName: string;
    score: number;
    rank: number;
    promotionStatus: PromotionStatus;
    next_schedule_id: mongoose.Types.ObjectId | null;
    rankingType: RankingType;
    updateTime: Date;
    createTime: Date;
}
