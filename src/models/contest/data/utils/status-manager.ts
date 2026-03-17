import { ContestStatus, StatusHistory } from "../types/contest-types";
import RedisCacheManager from "../../../../utils/redisCache";

/**
 * 状态管理器
 */
export class StatusManager {
    private _status: ContestStatus;
    private statusHistory: StatusHistory[];
    private cacheKey: string;
    private contestName: string;

    /**
     * 构造函数
     * @param initialStatus 初始状态
     * @param contestId 竞赛ID
     * @param contestName 竞赛名称
     */
    constructor(initialStatus: ContestStatus, contestId: number, contestName: string) {
        this._status = initialStatus;
        this.statusHistory = [];
        this.cacheKey = `contest:${contestId}:status`;
        this.contestName = contestName;

        // 初始化状态历史记录
        this.statusHistory.push({
            status: initialStatus,
            changeTime: new Date(),
            operator: "system",
            description: "竞赛创建"
        });
    }

    /**
     * 获取状态描述
     * @param status 状态
     * @returns 状态描述
     */
    getStatusDescription(status: ContestStatus): string {
        const statusMap = {
            0: "草稿",
            1: "审核中",
            2: "已发布",
            3: "报名中",
            4: "进行中",
            5: "已结束"
        };
        return statusMap[status] || "未知状态";
    }

    /**
     * 更新状态
     * @param status 状态
     * @param operator 操作者
     * @param description 描述
     * @param cacheBasicInfo 缓存基本信息的回调函数
     */
    updateStatus(status: ContestStatus, operator: string, description: string, cacheBasicInfo: () => void): void {
        if (this._status !== status) {
            this._status = status;
            // 记录状态变更历史
            this.statusHistory.push({
                status,
                changeTime: new Date(),
                operator,
                description
            });

            // 缓存状态到Redis，有效期1分钟
            RedisCacheManager.set(this.cacheKey, this._status, 60);

            // 缓存基本信息
            cacheBasicInfo();
        }
    }

    /**
     * 设置状态（setter）
     */
    set status(status: ContestStatus) {
        this.updateStatus(status, "system", this.getStatusDescription(status), () => {});
    }

    /**
     * 获取状态（getter）
     */
    get status(): ContestStatus {
        return this._status;
    }

    /**
     * 获取状态历史记录
     * @returns 状态历史记录
     */
    getStatusHistory(): StatusHistory[] {
        return this.statusHistory;
    }

    /**
     * 提交审核
     * @param operator 操作者
     * @param cacheBasicInfo 缓存基本信息的回调函数
     */
    submit(operator: string, cacheBasicInfo: () => void): void {
        this.updateStatus(1, operator, "提交审核", cacheBasicInfo);
    }

    /**
     * 发布竞赛
     * @param operator 操作者
     * @param cacheBasicInfo 缓存基本信息的回调函数
     */
    publish(operator: string, cacheBasicInfo: () => void): void {
        this.updateStatus(2, operator, "发布竞赛", cacheBasicInfo);
    }

    /**
     * 开放报名
     * @param operator 操作者
     * @param cacheBasicInfo 缓存基本信息的回调函数
     */
    openRegistration(operator: string, cacheBasicInfo: () => void): void {
        this.updateStatus(3, operator, "开放报名", cacheBasicInfo);
    }

    /**
     * 开始竞赛
     * @param cacheBasicInfo 缓存基本信息的回调函数
     */
    start(cacheBasicInfo: () => void): void {
        this.updateStatus(4, "system", "开始竞赛", cacheBasicInfo);
        console.log(`${this.contestName} 竞赛已开始`);
    }

    /**
     * 结束竞赛
     * @param cacheBasicInfo 缓存基本信息的回调函数
     * @param autoRank 自动排名的回调函数
     */
    end(cacheBasicInfo: () => void, autoRank: () => void): void {
        this.updateStatus(5, "system", "结束竞赛", cacheBasicInfo);
        // 自动排名
        autoRank();
        console.log(`${this.contestName} 竞赛已结束`);
    }
}
