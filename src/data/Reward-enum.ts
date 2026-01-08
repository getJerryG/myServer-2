// 奖励类型枚举
export enum RewardType {
    POINTS = "points", // 积分
    CURRENCY = "currency", // 货币
    CARD = "card", // 卡牌
    MEMBER_EXP = "member_exp", // 会员经验
    PLAYER_EXP = "player_exp" // 玩家经验
}

// 奖励状态枚举
export enum RewardStatus {
    UNISSUED = "unissued", // 未发放
    ISSUED = "issued", // 已发放
    EXPIRED = "expired", // 已过期
    CLAIMED = "claimed" // 已领取
}