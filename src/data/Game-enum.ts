// 狼人杀角色枚举
export enum WerewolfRole {
    WEREWOLF = "werewolf", // 狼人
    VILLAGER = "villager", // 村民
    SEER = "seer", // 预言家
    WITCH = "witch", // 女巫
    HUNTER = "hunter", // 猎人
    IDIOT = "idiot", // 白痴
    GUARD = "guard" // 守卫
}

// 游戏结果枚举
export enum GameResult {
    WOLF = "wolf", // 狼人胜利
    VILLAGE = "village", // 村民胜利
    DRAW = "draw", // 平局
    THIRD = "third" // 第三方胜利
}

// 游戏操作类型枚举
export enum GameAction {
    SHERIFF = "sheriff", // 警长
    EXILE = "exile" // 放逐
}