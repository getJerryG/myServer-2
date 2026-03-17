// 类型定义
interface Reward {
    type: string;
    amount: number;
}

interface User {
    id: number;
    rewards: Reward[];
}

// 福利数组
const wekfare = [];
let nextId = 0;

// 默认奖励函数
const defaultReward = (): Reward => {
    return {
        type: "",
        amount: 100
    };
};

// 创建基础福利
function createBaseWekfare(id: number, code: string, type: string, rewardFunction: () => Reward) {
    return {
        id,
        code,
        status: "",
        type,
        reward: rewardFunction, // 奖励函数
    };
}

// 创建用户福利
function createUserWekfare(code: string, rewardFunction: () => Reward = defaultReward) {
    const id = nextId++;
    const baseWekfare = createBaseWekfare(id, code, "user", rewardFunction);
    
    return {
        ...baseWekfare,
        used: false,
        usedByOthersCount: 0,
        maxUsedByOthers: 3,
        
        use(user: User, isSelfUse: boolean = true) {
            if (isSelfUse) {
                if (this.used) {
                    return { error: "福利已使用" };
                }
                this.used = true;
                user.rewards.push(this.reward());
                return { message: "福利使用成功" };
            } else {
                if (this.usedByOthersCount >= this.maxUsedByOthers) {
                    return { error: "福利已被他人使用完" };
                }
                this.usedByOthersCount++;
                user.rewards.push(this.reward());
                return { message: "福利使用成功" };
            }
        }
    };
}

// 创建一次性福利
function createOnceWekfare(code: string, rewardFunction: () => Reward = defaultReward) {
    const id = nextId++;
    const baseWekfare = createBaseWekfare(id, code, "once", rewardFunction);
    
    return {
        ...baseWekfare,
        
        use(user: User) {
            if (this.status === "used") {
                return { error: "福利已使用" };
            }
            this.status = "used";
            user.rewards.push(this.reward());
            
            const index = wekfare.indexOf(this);
            if (index > -1) {
                wekfare.splice(index, 1);
            }
            
            return { message: "福利使用成功" };
        }
    };
}

// 创建公共福利
function createPublicWekfare(code: string, rewardFunction: () => Reward = defaultReward) {
    const id = nextId++;
    const baseWekfare = createBaseWekfare(id, code, "public", rewardFunction);
    
    let currentHour = new Date().getHours();
    let totalUses = 0;
    const maxTotalUsesPerHour = 500;
    
    return {
        ...baseWekfare,
        usedToday: new Set<number>(),
        
        use(user: User) {
            const nowHour = new Date().getHours();
            if (nowHour !== currentHour) {
                currentHour = nowHour;
                totalUses = 0;
            }
            
            if (totalUses >= maxTotalUsesPerHour) {
                return { error: "当前时段福利已发放完毕" };
            }
            
            if (this.usedToday.has(user.id)) {
                return { error: "今日已领取过该福利" };
            }
            
            totalUses++;
            this.usedToday.add(user.id);
            user.rewards.push(this.reward());
            
            return { message: "福利领取成功" };
        }
    };
}

// 创建福利工厂函数
function createWekfare(type: string, code: string, rewardFunction: () => Reward = defaultReward) {
    if (!type) {
        throw new Error("福利类型不能为空");
    }
    
    switch (type) {
    case "user":
        return createUserWekfare(code, rewardFunction);
    case "once":
        return createOnceWekfare(code, rewardFunction);
    case "public":
        return createPublicWekfare(code, rewardFunction);
    default:
        throw new Error("未知的福利类型");
    }
}

// 导出相关函数
export { createWekfare, createUserWekfare, createOnceWekfare, createPublicWekfare };
export default wekfare;