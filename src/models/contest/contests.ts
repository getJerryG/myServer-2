// 竞赛状态枚举
export enum ContestStatus {
    NOT_STARTED = 0,
    REGISTERING = 1,
    RUNNING = 2,
    ENDED = 3
}

// 竞赛接口
export interface Contest {
    id: number;
    name: string;
    startDay: string;
    endDay: string;
    currentSignTeams: number;
    maxSignTeams: number;
    status: ContestStatus;
}

/**
 * 竞赛管理类
 * 用于管理竞赛信息，包括创建、更新、删除竞赛等操作
 */
export default class Contests {
    private static data: Contest[] = [
        {
            id: 1,
            name: "测试竞赛",
            startDay: "2023-01-01",
            endDay: "2023-12-31",
            currentSignTeams: 5,
            maxSignTeams: 10,
            status: ContestStatus.RUNNING
        },
        {
            id: 2,
            name: "新年竞赛",
            startDay: "2024-01-01",
            endDay: "2024-01-31",
            currentSignTeams: 0,
            maxSignTeams: 20,
            status: ContestStatus.NOT_STARTED
        }
    ];

    /**
     * 获取所有竞赛
     * @returns 竞赛列表
     */
    static getAllContests(): Contest[] {
        return this.data;
    }

    /**
     * 根据ID或名称获取竞赛
     * @param find 竞赛ID或名称
     * @returns 竞赛信息或undefined
     */
    static getContest(find: string | number): Contest | undefined {
        if (typeof find === "string") {
            return this.data.find((contest) => contest.name === find);
        } else {
            return this.data.find((contest) => contest.id === find);
        }
    }

    /**
     * 获取活跃竞赛
     * @returns 活跃竞赛列表
     */
    static getActiveContests(): Contest[] {
        return this.data.filter(contest => contest.status === ContestStatus.RUNNING);
    }

    /**
     * 根据状态获取竞赛
     * @param status 竞赛状态
     * @returns 竞赛列表
     */
    static getContestsByStatus(status: ContestStatus): Contest[] {
        return this.data.filter(contest => contest.status === status);
    }

    /**
     * 增加当前报名队伍数
     * @param id 竞赛ID
     * @returns 更新后的竞赛信息或undefined
     */
    static incrementCurrentSignTeams(id: number): Contest | undefined {
        const contest = this.data.find(contest => contest.id === id);
        if (contest && contest.currentSignTeams < contest.maxSignTeams) {
            contest.currentSignTeams++;
        }
        return contest;
    }

    /**
     * 减少当前报名队伍数
     * @param id 竞赛ID
     * @returns 更新后的竞赛信息或undefined
     */
    static decrementCurrentSignTeams(id: number): Contest | undefined {
        const contest = this.data.find(contest => contest.id === id);
        if (contest && contest.currentSignTeams > 0) {
            contest.currentSignTeams--;
        }
        return contest;
    }

    /**
     * 更新竞赛状态
     * @param id 竞赛ID
     * @param status 竞赛状态
     * @returns 更新后的竞赛信息或undefined
     */
    static updateContestStatus(id: number, status: ContestStatus): Contest | undefined {
        const contest = this.data.find(contest => contest.id === id);
        if (contest) {
            contest.status = status;
        }
        return contest;
    }
}