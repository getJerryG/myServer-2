import RedisCacheManager from "../../../../utils/redisCache";
import Team from "../../../Team";
import { ContestRanking } from "../types/contest-types";

/**
 * 缓存管理器
 */
export class CacheManager {
    private contestId: number;
    private cacheKeys: {
        info: string;
        status: string;
        signTeams: string;
        signTeamsCount: string;
        ranking: string;
        schedule: string;
    };

    /**
     * 构造函数
     * @param contestId 竞赛ID
     */
    constructor(contestId: number) {
        this.contestId = contestId;
        this.cacheKeys = {
            info: `contest:${contestId}:info`,
            status: `contest:${contestId}:status`,
            signTeams: `contest:${contestId}:signTeams`,
            signTeamsCount: `contest:${contestId}:signTeamsCount`,
            ranking: `contest:${contestId}:ranking`,
            schedule: `contest:${contestId}:schedule`
        };
    }

    /**
     * 缓存基本信息
     * @param basicInfo 基本信息
     */
    async cacheBasicInfo(basicInfo: Record<string, unknown>): Promise<void> {
        await RedisCacheManager.set(this.cacheKeys.info, basicInfo, 3600); // 1小时
        await RedisCacheManager.set(this.cacheKeys.status, basicInfo.status, 60); // 1分钟
        await RedisCacheManager.set(this.cacheKeys.schedule, basicInfo.contestSchedule, 3600); // 1小时
    }

    /**
     * 缓存报名队伍
     * @param signTeams 报名队伍集合
     */
    async cacheSignTeams(signTeams: Set<Team>): Promise<void> {
        const signTeamsArray = Array.from(signTeams).map((team) => ({
            id: team.id,
            name: team.name,
            clan: team.clan.name,
            leader: team.leader
        }));
        await RedisCacheManager.set(this.cacheKeys.signTeams, signTeamsArray, 300); // 5分钟
        await RedisCacheManager.set(this.cacheKeys.signTeamsCount, signTeams.size, 60); // 1分钟
    }

    /**
     * 缓存排名
     * @param ranking 排名列表
     */
    async cacheRanking(ranking: ContestRanking[]): Promise<void> {
        await RedisCacheManager.set(this.cacheKeys.ranking, ranking, 300); // 5分钟
    }

    /**
     * 获取缓存键
     * @returns 缓存键对象
     */
    get cacheKey(): {
        info: string;
        status: string;
        signTeams: string;
        signTeamsCount: string;
        ranking: string;
        schedule: string;
        } {
        return this.cacheKeys;
    }
}
