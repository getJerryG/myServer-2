import { Schema, FilterQuery } from "mongoose";
import { RewardRecord, RewardStat } from "@/models/Reward/rewardModel";
import { RewardType, RewardStatus } from "@/data/Reward-enum";

/**
 * 奖励控制器类
 */
class RewardController {
    private type: RewardType;
    private amount: number;
    
    /**
     * 构造函数
     * @param type 奖励类型
     * @param amount 奖励金额
     */
    constructor(type: RewardType, amount: number) {
        this.type = type;
        this.amount = amount;
    }
    
    /**
     * 奖励用户
     * @param user_id 用户ID
     * @param admin_id 管理员ID
     * @param reason 奖励原因
     */
    async rewardUser(
        user_id: Schema.Types.ObjectId,
        admin_id?: Schema.Types.ObjectId,
        reason?: string
    ): Promise<RewardRecord> {
        const reward = new RewardRecord({
            type: this.type,
            amount: this.amount,
            user_id,
            admin_id,
            reason,
            status: RewardStatus.UNISSUED
        });
        
        return await reward.save();
    }
    
    /**
     * 奖励统计
     */
    async rewardStat(): Promise<RewardStat> {
        const rewardStat = new RewardStat({
            type: this.type,
            total_amount: this.amount,
            user_count: 1,
            last_update: new Date()
        });
        
        return await rewardStat.save();
    }
    
    /**
     * 发放奖励
     * @param rewardId 奖励ID
     */
    async issueReward(rewardId: Schema.Types.ObjectId): Promise<RewardRecord | null> {
        try {
            const reward = await RewardRecord.findById(rewardId);
            
            if (!reward) {
                console.log(`奖励ID不存在: ${rewardId}`);
                return null;
            }
            
            reward.status = RewardStatus.ISSUED;
            await reward.save();
            console.log(`奖励发放成功: ${rewardId}`);
            
            return reward;
        } catch (error) {
            console.error(`发放奖励失败 - ID: ${rewardId}, 错误: ${error}`);
            throw error;
        }
    }
    
    /**
     * 搜索奖励
     * @param query 查询条件
     */
    async searchRewards(query: FilterQuery<typeof RewardRecord>): Promise<RewardRecord[]> {
        try {
            const rewards = await RewardRecord.find(query);
            console.log(`搜索到奖励数量: ${rewards.length}`);
            return rewards;
        } catch (error) {
            console.error(`搜索奖励失败: ${error}`);
            throw error;
        }
    }
    
    /**
     * 搜索用户奖励
     * @param userId 用户ID
     */
    async searchUserRewards(userId: Schema.Types.ObjectId): Promise<RewardRecord[]> {
        try {
            const rewards = await RewardRecord.find({ user_id: userId });
            console.log(`用户 ${userId} 的奖励数量: ${rewards.length}`);
            return rewards;
        } catch (error) {
            console.error(`搜索用户奖励失败 - 用户ID: ${userId}, 错误: ${error}`);
            throw error;
        }
    }
    
    /**
     * 领取奖励
     * @param rewardId 奖励ID
     */
    async claimReward(rewardId: Schema.Types.ObjectId): Promise<RewardRecord | null> {
        try {
            const reward = await RewardRecord.findById(rewardId);
            
            if (!reward) {
                console.log(`奖励ID不存在: ${rewardId}`);
                return null;
            }
            
            if (reward.status !== RewardStatus.ISSUED) {
                console.log(`奖励 ${rewardId} 当前状态: ${reward.status}`);
                return reward;
            }
            
            reward.status = RewardStatus.CLAIMED;
            await reward.save();
            console.log(`奖励领取成功: ${rewardId}`);
            
            return reward;
        } catch (error) {
            console.error(`领取奖励失败 - ID: ${rewardId}, 错误: ${error}`);
            throw error;
        }
    }
}

export default RewardController;