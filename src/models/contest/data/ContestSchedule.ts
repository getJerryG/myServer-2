/**
 * 赛程状态枚举
 */
export enum ScheduleStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2
}

/**
 * 竞赛状态枚举
 */
export enum ContestStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2
}

/**
 * 赛程安排接口
 */
export interface Arrangement {
    room: string;
    date?: Date;
    rounds: string | number;
    multiplier: string | number;
}

/**
 * 竞赛赛程配置接口
 */
export interface IContestSchedule {
    name: string;
    startTime: Date;
    schedule: Arrangement[];
}

/**
 * 完整竞赛赛程接口
 */
export interface CompleteContestSchedule {
    /** 开始日期 */
    startDay: string;
    /** 结束日期 */
    endDay: string;
    /** 赛程列表 */
    schedule: ContestSchedule[];
    /** 所有赛程项 */
    all: Schedule[];
    /** 状态 */
    status?: ContestStatus;
}

const GROUP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 默认开始时间：19:00
const DEFAULT_START_TIME = new Date();
DEFAULT_START_TIME.setHours(19, 0, 0, 0);

/**
 * 赛程类
 */
export class Schedule {
    /** 名称 */
    name: string;
    /** 标题 */
    title: string;
    /** 日期 YYYY-MM-DD */
    date: string;
    /** 时间 HH:MM */
    time: string;
    /** 房间 */
    room: string;
    /** 轮次 */
    rounds: number;
    /** 倍数 */
    multiplier: number;

    /**
     * 构造函数
     * @param date 日期
     * @param arrangement 赛程安排
     * @param stageName 阶段名称
     * @param groupIdentifier 分组标识
     */
    constructor(date: Date = DEFAULT_START_TIME, arrangement: Arrangement, stageName: string, groupIdentifier: string) {
        this.name = `${stageName}${groupIdentifier}`;
        this.date = date.toISOString().split("T")[0];
        this.title = `${stageName}${this.date}`;
        this.time = date.toTimeString().split(" ")[0].substring(0, 5) || "19:00";
        this.room = arrangement.room || "";
        this.rounds = Number(arrangement.rounds) || 1;
        this.multiplier = Number(arrangement.multiplier) || 1;
    }

    /**
     * 获取星期几（1-7）
     */
    get week(): number {
        return new Date(this.date).getDay() + 1;
    }

    /**
     * 获取赛程状态
     */
    get status(): ScheduleStatus {
        const now = new Date();
        const scheduleDate = new Date(this.date);
        
        if (now > scheduleDate) {
            return ScheduleStatus.COMPLETED;
        } else if (now < scheduleDate) {
            return ScheduleStatus.NOT_STARTED;
        } else {
            return ScheduleStatus.IN_PROGRESS;
        }
    }
}

/**
 * 竞赛赛程类
 */
export class ContestSchedule {
    /** 名称 */
    name: string;
    /** 赛程列表 */
    schedule: Schedule[];

    /**
     * 构造函数
     * @param name 名称
     * @param schedule 赛程列表
     */
    constructor(name: string, schedule: Schedule[]) {
        this.name = name;
        this.schedule = schedule;
    }

    /**
     * 获取开始日期
     */
    get startDay(): string {
        return this.schedule[0].date;
    }

    /**
     * 获取结束日期
     */
    get endDay(): string {
        return this.schedule[this.schedule.length - 1].date;
    }

    /**
     * 获取日期数量
     */
    get dateCount(): number {
        const formatDate = (dateStr: string): Date => {
            return new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00.000Z`);
        };
        
        const startDate = formatDate(this.startDay);
        const endDate = formatDate(this.endDay);
        endDate.setHours(23, 59, 59, 999);
        
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }

    /**
     * 获取竞赛状态
     */
    get status(): ContestStatus {
        const now = new Date();
        const startDate = new Date(this.startDay);
        const endDate = new Date(this.endDay);
        endDate.setHours(23, 59, 59, 999);
        
        if (now < startDate) {
            return ContestStatus.NOT_STARTED;
        } else if (now > endDate) {
            return ContestStatus.COMPLETED;
        } else {
            return ContestStatus.IN_PROGRESS;
        }
    }

    /**
     * 获取是否完成
     */
    get done(): boolean {
        return this.schedule.every((item) => item.status === ScheduleStatus.COMPLETED);
    }
}

/**
 * 获取分组标识
 * @param groupIndex 分组索引
 * @returns 分组标识（如 A, B, C）
 */
function getGroupIdentifier(groupIndex: number): string {
    const groupLetter = GROUP_LETTERS[groupIndex % GROUP_LETTERS.length];
    return `${groupLetter}`;
}

/**
 * 创建竞赛阶段赛程
 * @param stageName 阶段名称
 * @param startTime 开始时间
 * @param arrangements 赛程安排
 * @returns 竞赛赛程
 */
function createContestStageSchedule(
    stageName: string, 
    startTime: Date = DEFAULT_START_TIME,
    arrangements: Arrangement[]
): ContestSchedule {
    const scheduleList: Schedule[] = [];
    const totalGames = arrangements.length;
    let currentDate = new Date(startTime);
    let currentGroupIndex = 0;
    let previousDate = "";

    for (let i = 0; i < totalGames; i++) {
        const arrangement = arrangements[i];

        // 获取比赛日期
        const gameDate = arrangement.date || new Date(currentDate);
        const gameDateStr = gameDate.toISOString().split("T")[0];

        // 如果日期变化，分组索引递增
        if (previousDate && previousDate !== gameDateStr) {
            currentGroupIndex++;
        }
        previousDate = gameDateStr;

        // 创建赛程项
        const groupIdentifier = getGroupIdentifier(currentGroupIndex);
        const scheduleItem = new Schedule(gameDate, arrangement, stageName, groupIdentifier);
        scheduleList.push(scheduleItem);

        // 日期加1
        currentDate = new Date(gameDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return new ContestSchedule(stageName, scheduleList);
}

/**
 * 创建竞赛赛程
 * @param scheduleConfigs 赛程配置列表
 * @returns 完整竞赛赛程
 */
export default function createContestSchedule(scheduleConfigs: IContestSchedule[]): CompleteContestSchedule {
    const allStageSchedules = scheduleConfigs.map((config) =>
        createContestStageSchedule(config.name, config.startTime, config.schedule)
    );

    // 获取最早开始日期
    const startDay = allStageSchedules.reduce((earliest, current) => {
        return current.startDay < earliest ? current.startDay : earliest;
    }, allStageSchedules[0].startDay);

    // 获取最晚结束日期
    const endDay = allStageSchedules.reduce((latest, current) => {
        return current.endDay > latest ? current.endDay : latest;
    }, allStageSchedules[0].endDay);

    // 获取所有赛程项
    const allSchedules = allStageSchedules.flatMap((stage) => stage.schedule);

    return {
        startDay,
        endDay,
        schedule: allStageSchedules,
        all: allSchedules
    };
}
