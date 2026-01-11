// 竞赛日程相关定义

/** 违规类型 */
export type ViolationType = "lateJoinGroup" | "lateSignIn" | "lateEnterRoom" | "forfeit";

/** 选手当天状态枚举（二进制位表示） */
export enum PlayerDayStatus {
    /** 未进群、未签到、未进房、未完成游戏 (0000) */
    NONE = 0,
    /** 已进群 (0001) */
    JOINED_GROUP = 1,
    /** 已签到 (0010) */
    SIGNED_IN = 2,
    /** 已进群 + 已签到 (0011) */
    JOINED_AND_SIGNED = 3,
    /** 已进房 (0100) */
    ENTERED_ROOM = 4,
    /** 已进群 + 已进房 (0101) */
    JOINED_AND_ENTERED = 5,
    /** 已签到 + 已进房 (0110) */
    SIGNED_AND_ENTERED = 6,
    /** 已进群 + 已签到 + 已进房 (0111) */
    FULL_PREPARATION = 7,
    /** 已完成游戏 (1000) */
    GAME_COMPLETED = 8,
    /** 已进群 + 已完成游戏 (1001) */
    JOINED_AND_COMPLETED = 9,
    /** 已签到 + 已完成游戏 (1010) */
    SIGNED_AND_COMPLETED = 10,
    /** 已进群 + 已签到 + 已完成游戏 (1011) */
    JOINED_SIGNED_AND_COMPLETED = 11,
    /** 已进房 + 已完成游戏 (1100) */
    ENTERED_AND_COMPLETED = 12,
    /** 已进群 + 已进房 + 已完成游戏 (1101) */
    JOINED_ENTERED_AND_COMPLETED = 13,
    /** 已签到 + 已进房 + 已完成游戏 (1110) */
    SIGNED_ENTERED_AND_COMPLETED = 14,
    /** 已进群 + 已签到 + 已进房 + 已完成游戏 (1111) */
    FULL_COMPLETION = 15
}

/** 选手当天详细状态 */
export interface PlayerDayDetail {
    /** 是否已进群 */
    isJoinedGroup: boolean;
    /** 是否已签到 */
    isSignedIn: boolean;
    /** 是否已进房 */
    isEnteredRoom: boolean;
    /** 是否完成游戏 */
    isGameCompleted: boolean;
    /** 二进制状态值 */
    statusValue: PlayerDayStatus;
    /** 二进制状态字符串 */
    statusBinary: string;
}

/** 竞赛每日赛程 */
export interface ContestDaySchedule {
    /** 加入群组时间 */
    joinGroupTime: string;
    /** 签到开始时间 */
    signInStartTime: string;
    /** 签到结束时间 */
    signInEndTime: string;
    /** 进入房间开始时间 */
    enterRoomStartTime: string;
    /** 进入房间结束时间 */
    enterRoomEndTime: string;
    /** 比赛开始时间 */
    matchStartTime: string;
}

/** 竞赛每日违规设置 */
export interface ContestDayViolation {
    /** 迟到加入群组罚款 */
    lateJoinGroup: number;
    /** 迟到签到罚款 */
    lateSignIn: number;
    /** 迟到进入房间罚款 */
    lateEnterRoom: number;
    /** 弃权时间 */
    forfeitTime: string;
    /** 弃权罚款 */
    forfeitPenalty: number;
}

/** 竞赛每日数据 */
export interface ContestDayData {
    /** 赛程安排 */
    schedule: ContestDaySchedule;
    /** 违规设置 */
    violations: ContestDayViolation;
}

/** 竞赛日程类 */
export default class ContestDay {
    /** 加入群组时间 */
    joinGroupTime: string;
    /** 签到开始时间 */
    signInStartTime: string;
    /** 签到结束时间 */
    signInEndTime: string;
    /** 进入房间开始时间 */
    enterRoomStartTime: string;
    /** 进入房间结束时间 */
    enterRoomEndTime: string;
    /** 比赛开始时间 */
    matchStartTime: string;
    /** 迟到加入群组罚款 */
    lateJoinGroupPenalty: number;
    /** 迟到签到罚款 */
    lateSignInPenalty: number;
    /** 迟到进入房间罚款 */
    lateEnterRoomPenalty: number;
    /** 弃权时间 */
    forfeitTime: string;
    /** 弃权罚款 */
    forfeitPenalty: number;

    /**
     * 构造函数
     * @param data 竞赛每日数据
     */
    constructor(data: ContestDayData) {
        this.joinGroupTime = data.schedule.joinGroupTime;
        this.signInStartTime = data.schedule.signInStartTime;
        this.signInEndTime = data.schedule.signInEndTime;
        this.enterRoomStartTime = data.schedule.enterRoomStartTime;
        this.enterRoomEndTime = data.schedule.enterRoomEndTime;
        this.matchStartTime = data.schedule.matchStartTime;

        this.lateJoinGroupPenalty = data.violations.lateJoinGroup;
        this.lateSignInPenalty = data.violations.lateSignIn;
        this.lateEnterRoomPenalty = data.violations.lateEnterRoom;
        this.forfeitTime = data.violations.forfeitTime;
        this.forfeitPenalty = data.violations.forfeitPenalty;
    }

    /**
     * 检查是否准时加入群组
     * @param time 加入时间
     * @returns 是否准时
     */
    isJoinGroupOnTime(time: string): boolean {
        return this.compareTime(time, this.joinGroupTime) <= 0;
    }

    /**
     * 检查是否准时签到
     * @param time 签到时间
     * @returns 是否准时
     */
    isSignInOnTime(time: string): boolean {
        return this.compareTime(time, this.signInStartTime) >= 0 && this.compareTime(time, this.signInEndTime) <= 0;
    }

    /**
     * 检查是否准时进入房间
     * @param time 进入房间时间
     * @returns 是否准时
     */
    isEnterRoomOnTime(time: string): boolean {
        return this.compareTime(time, this.enterRoomStartTime) >= 0 && this.compareTime(time, this.enterRoomEndTime) <= 0;
    }

    /**
     * 检查是否弃权
     * @param time 当前时间
     * @returns 是否弃权
     */
    isForfeit(time: string): boolean {
        return this.compareTime(time, this.forfeitTime) > 0;
    }

    /**
     * 获取违规罚款
     * @param type 违规类型
     * @returns 罚款金额
     */
    getPenalty(type: ViolationType): number {
        switch (type) {
        case "lateJoinGroup":
            return this.lateJoinGroupPenalty;
        case "lateSignIn":
            return this.lateSignInPenalty;
        case "lateEnterRoom":
            return this.lateEnterRoomPenalty;
        case "forfeit":
            return this.forfeitPenalty;
        default: return 0;
        }
    }

    /**
     * 比较两个时间
     * @param time1 时间1 (格式: HH:MM)
     * @param time2 时间2 (格式: HH:MM)
     * @returns 时间1 - 时间2 的分钟差
     */
    private compareTime(time1: string, time2: string): number {
        const [h1, m1] = time1.split(":").map(Number);
        const [h2, m2] = time2.split(":").map(Number);
        return (h1 - h2) * 60 + (m1 - m2);
    }

    /**
     * 获取赛程安排
     * @returns 赛程安排
     */
    getSchedule(): ContestDaySchedule {
        return {
            joinGroupTime: this.joinGroupTime,
            signInStartTime: this.signInStartTime,
            signInEndTime: this.signInEndTime,
            enterRoomStartTime: this.enterRoomStartTime,
            enterRoomEndTime: this.enterRoomEndTime,
            matchStartTime: this.matchStartTime
        };
    }

    /**
     * 获取违规设置
     * @returns 违规设置
     */
    getViolations(): ContestDayViolation {
        return {
            lateJoinGroup: this.lateJoinGroupPenalty,
            lateSignIn: this.lateSignInPenalty,
            lateEnterRoom: this.lateEnterRoomPenalty,
            forfeitTime: this.forfeitTime,
            forfeitPenalty: this.forfeitPenalty
        };
    }

    /**
     * 获取可读的赛程安排
     * @returns 可读的赛程安排
     */
    getReadableSchedule(): string {
        return `
加入群组时间: ${this.joinGroupTime}
签到时间: ${this.signInStartTime}-${this.signInEndTime}
进入房间时间: ${this.enterRoomStartTime}-${this.enterRoomEndTime}
比赛开始时间: ${this.matchStartTime}
    `.trim();
    }

    /**
     * 获取可读的违规设置
     * @returns 可读的违规设置
     */
    getReadableViolations(): string {
        return `
迟到加入群组罚款: ${this.lateJoinGroupPenalty}
迟到签到罚款: ${this.lateSignInPenalty}
迟到进入房间罚款: ${this.lateEnterRoomPenalty}
弃权时间: ${this.forfeitTime}
弃权罚款: ${this.forfeitPenalty}
    `.trim();
    }

    /**
     * 根据选手的各个状态生成二进制状态值
     * @param isJoinedGroup 是否已进群
     * @param isSignedIn 是否已签到
     * @param isEnteredRoom 是否已进房
     * @param isGameCompleted 是否完成游戏
     * @returns 二进制状态值
     */
    static generatePlayerStatus(
        isJoinedGroup: boolean,
        isSignedIn: boolean,
        isEnteredRoom: boolean,
        isGameCompleted: boolean
    ): PlayerDayStatus {
        let status = 0;
        if (isJoinedGroup) status |= PlayerDayStatus.JOINED_GROUP;
        if (isSignedIn) status |= PlayerDayStatus.SIGNED_IN;
        if (isEnteredRoom) status |= PlayerDayStatus.ENTERED_ROOM;
        if (isGameCompleted) status |= PlayerDayStatus.GAME_COMPLETED;
        return status as PlayerDayStatus;
    }

    /**
     * 解析二进制状态值，返回详细的状态信息
     * @param status 二进制状态值
     * @returns 详细的状态信息
     */
    static parsePlayerStatus(status: PlayerDayStatus): PlayerDayDetail {
        const isJoinedGroup = !!(status & PlayerDayStatus.JOINED_GROUP);
        const isSignedIn = !!(status & PlayerDayStatus.SIGNED_IN);
        const isEnteredRoom = !!(status & PlayerDayStatus.ENTERED_ROOM);
        const isGameCompleted = !!(status & PlayerDayStatus.GAME_COMPLETED);
        
        return {
            isJoinedGroup,
            isSignedIn,
            isEnteredRoom,
            isGameCompleted,
            statusValue: status,
            statusBinary: status.toString(2).padStart(4, "0")
        };
    }

    /**
     * 检查选手的状态是否符合要求
     * @param status 选手的二进制状态值
     * @param requiredStatus 要求的二进制状态值
     * @returns 是否符合要求
     */
    static checkPlayerStatus(status: PlayerDayStatus, requiredStatus: PlayerDayStatus): boolean {
        return (status & requiredStatus) === requiredStatus;
    }

    /**
     * 更新选手的状态
     * @param currentStatus 当前二进制状态值
     * @param newStatus 要添加的二进制状态值
     * @returns 更新后的二进制状态值
     */
    static updatePlayerStatus(currentStatus: PlayerDayStatus, newStatus: PlayerDayStatus): PlayerDayStatus {
        return (currentStatus | newStatus) as PlayerDayStatus;
    }

    /**
     * 移除选手的某个状态
     * @param currentStatus 当前二进制状态值
     * @param statusToRemove 要移除的二进制状态值
     * @returns 更新后的二进制状态值
     */
    static removePlayerStatus(currentStatus: PlayerDayStatus, statusToRemove: PlayerDayStatus): PlayerDayStatus {
        return (currentStatus & ~statusToRemove) as PlayerDayStatus;
    }
}