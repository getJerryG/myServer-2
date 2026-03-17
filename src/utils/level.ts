/**
 * 等级计算工具
 */

// 最大等级
const LV_MAX = 100;

// 等级节点接口
export interface LevelNode {
    level: number;
    exp: number;
    totalExperience?: number;
}

// 等级节点数组
const levelNodes: LevelNode[] = [
    { level: 1, exp: 500 },
    { level: 2, exp: 1000 },
    { level: 3, exp: 2000 },
    { level: 7, exp: 5000 },
    { level: 15, exp: 10000 },
    { level: 20, exp: 11111 },
    { level: 35, exp: 48888 },
    { level: 44, exp: 66666 },
    { level: 50, exp: 88888 },
    { level: 71, exp: 100000 },
    { level: 90, exp: 888888 }
];

// 获取等级节点数组，确保节点按等级排序并包含所有等级
export function getLvNodes(nodes: LevelNode[], maxLevel: number): LevelNode[] {
    // 按等级排序
    const sortedNodes = [...nodes].sort((a, b) => a.level - b.level);
    
    // 生成完整的等级节点数组
    const fullNodes: LevelNode[] = [];
    let prevExp = 0;
    
    for (let i = 0; i <= maxLevel; i++) {
        const node = sortedNodes.find(n => n.level === i);
        if (node) {
            fullNodes.push({
                level: i,
                exp: node.exp,
                totalExperience: prevExp + node.exp
            });
            prevExp += node.exp;
        } else {
            // 如果没有定义该等级的经验值，使用前一个等级的经验值
            const lastNode = fullNodes[fullNodes.length - 1];
            fullNodes.push({
                level: i,
                exp: lastNode ? lastNode.exp : 0,
                totalExperience: prevExp
            });
        }
    }
    
    return fullNodes;
}

// 当前等级节点数组
const currentNodes = getLvNodes(levelNodes, LV_MAX);

/**
 * 计算当前等级
 * @param currentExp 当前经验值
 * @returns 等级信息
 */
export function calculateLevel(currentExp: number) {
    if (currentExp < 0) {
        throw new Error("经验值不能为负数");
    }
    
    // 找到当前等级
    let currentLevel = 0;
    let prevExp = 0;
    let nextNode: LevelNode | undefined;
    
    for (let i = 0; i < currentNodes.length; i++) {
        const node = currentNodes[i];
        if (currentExp >= (node.totalExperience || 0)) {
            currentLevel = node.level;
            prevExp = node.totalExperience || 0;
            nextNode = currentNodes[i + 1];
        } else {
            break;
        }
    }
    
    // 计算升级所需经验
    const requireExp = nextNode && nextNode.totalExperience ? 
        Math.max(0, (nextNode.totalExperience || 0) - prevExp) : 0;
    
    return {
        currentLevel,
        currentExp,
        requireExp,
        isMax: currentLevel === LV_MAX
    };
}

/**
 * 升级函数
 * @param currentExp 当前经验值
 * @param targetLevel 目标等级
 * @returns 升级后的等级信息
 */
export function upgrade(currentExp: number, targetLevel: number) {
    if (targetLevel < 0) {
        throw new Error("目标等级不能为负数");
    }
    
    if (targetLevel > LV_MAX) {
        throw new Error(`目标等级不能超过最大等级 ${LV_MAX}`);
    }
    
    // 计算当前等级
    const currentLevelInfo = calculateLevel(currentExp);
    
    if (targetLevel <= currentLevelInfo.currentLevel) {
        return currentLevelInfo;
    }
    
    // 计算升级所需的总经验
    let totalExpNeeded = 0;
    for (let i = currentLevelInfo.currentLevel + 1; i <= targetLevel; i++) {
        const node = currentNodes[i];
        if (node) {
            totalExpNeeded += node.exp;
        }
    }
    
    // 计算新的经验值
    const newTotalExp = currentExp + totalExpNeeded;
    
    // 返回新的等级信息
    return calculateLevel(newTotalExp);
}

// 导出模块
export { currentNodes };
