import RedisCacheManager from "../../utils/redisCache";
import { ITitle, IUserTitle, IClanTitle } from "./TitleModel";

/**
 * 头衔缓存键配置
 */
export const TitleCacheKeys = {
    // 按ID缓存头衔
    TITLE_BY_ID: (id: string) => `title:id:${id}`,
    // 按类型缓存头衔
    TITLES_BY_TYPE: (type: string) => `title:type:${type}`,
    // 按稀有度缓存头衔
    TITLES_BY_RARITY: (rarity: string) => `title:rarity:${rarity}`,
    // 热门头衔
    POPULAR_TITLES: "title:popular",
    // 用户头衔
    USER_TITLES: (userId: string) => `title:user:${userId}`,
    // 用户已装备头衔
    USER_EQUIPPED_TITLE: (userId: string) => `title:equipped:${userId}`,
    // 战队头衔
    CLAN_TITLES: (clanId: string) => `title:clan:${clanId}`,
    // 头衔统计
    TITLE_STATS: "title:stats",
    // 即将过期头衔
    EXPIRING_TITLES: (days: number) => `title:expiring:${days}`,
    // 限时头衔
    TIME_LIMITED_TITLES: "title:timelimited",
    // 永久头衔
    PERMANENT_TITLES: "title:permanent"
};

/**
 * 头衔缓存过期时间配置（秒）
 */
export const TitleCacheExpiration = {
    TITLE_DETAIL: 3600, // 1小时
    TITLE_LIST: 1800, // 30分钟
    USER_TITLES: 300, // 5分钟
    CLAN_TITLES: 300, // 5分钟
    POPULAR_TITLES: 600, // 10分钟
    TITLE_STATS: 3600, // 1小时
    EXPIRING_TITLES: 3600, // 1小时
    EQUIPPED_TITLE: 3600 // 1小时
};

/**
 * 头衔缓存服务类
 * 处理头衔相关的缓存操作
 */
export default class TitleCacheService {
    /**
     * 缓存头衔
     * @param title 头衔对象
     */
    static async cacheTitle(title: ITitle): Promise<void> {
        const cacheKey = TitleCacheKeys.TITLE_BY_ID(title.id);
        await RedisCacheManager.set(cacheKey, title, TitleCacheExpiration.TITLE_DETAIL);
        
        // 添加到布隆过滤器
        await RedisCacheManager.getBloomFilter().add(title.id);
    }

    /**
     * 从缓存获取头衔
     * @param titleId 头衔ID
     * @returns 头衔对象
     */
    static async getTitleFromCache(titleId: string): Promise<ITitle | undefined> {
        const cacheKey = TitleCacheKeys.TITLE_BY_ID(titleId);
        return RedisCacheManager.get<ITitle>(cacheKey);
    }

    /**
     * 删除头衔缓存
     * @param titleId 头衔ID
     */
    static async deleteTitleCache(titleId: string): Promise<void> {
        const cacheKey = TitleCacheKeys.TITLE_BY_ID(titleId);
        await RedisCacheManager.del(cacheKey);
    }

    /**
     * 缓存头衔列表
     * @param key 缓存键
     * @param titles 头衔列表
     */
    static async cacheTitleList(key: string, titles: ITitle[]): Promise<void> {
        await RedisCacheManager.set(key, titles, TitleCacheExpiration.TITLE_LIST);
    }

    /**
     * 从缓存获取头衔列表
     * @param key 缓存键
     * @returns 头衔列表
     */
    static async getTitleListFromCache(key: string): Promise<ITitle[] | undefined> {
        return RedisCacheManager.get<ITitle[]>(key);
    }

    /**
     * 缓存用户头衔
     * @param userId 用户ID
     * @param userTitles 用户头衔列表
     */
    static async cacheUserTitles(userId: string, userTitles: IUserTitle[]): Promise<void> {
        const cacheKey = TitleCacheKeys.USER_TITLES(userId);
        await RedisCacheManager.set(cacheKey, userTitles, TitleCacheExpiration.USER_TITLES);
    }

    /**
     * 从缓存获取用户头衔
     * @param userId 用户ID
     * @returns 用户头衔列表
     */
    static async getUserTitlesFromCache(userId: string): Promise<IUserTitle[] | undefined> {
        const cacheKey = TitleCacheKeys.USER_TITLES(userId);
        return RedisCacheManager.get<IUserTitle[]>(cacheKey);
    }

    /**
     * 缓存用户已装备头衔
     * @param userId 用户ID
     * @param titleId 头衔ID
     */
    static async cacheUserEquippedTitle(userId: string, titleId: string): Promise<void> {
        const cacheKey = TitleCacheKeys.USER_EQUIPPED_TITLE(userId);
        await RedisCacheManager.set(cacheKey, titleId, TitleCacheExpiration.EQUIPPED_TITLE);
    }

    /**
     * 从缓存获取用户已装备头衔
     * @param userId 用户ID
     * @returns 头衔ID
     */
    static async getUserEquippedTitleFromCache(userId: string): Promise<string | undefined> {
        const cacheKey = TitleCacheKeys.USER_EQUIPPED_TITLE(userId);
        return RedisCacheManager.get<string>(cacheKey);
    }

    /**
     * 删除用户已装备头衔缓存
     * @param userId 用户ID
     */
    static async deleteUserEquippedTitleCache(userId: string): Promise<void> {
        const cacheKey = TitleCacheKeys.USER_EQUIPPED_TITLE(userId);
        await RedisCacheManager.del(cacheKey);
    }

    /**
     * 缓存战队头衔
     * @param clanId 战队ID
     * @param clanTitles 战队头衔列表
     */
    static async cacheClanTitles(clanId: string, clanTitles: IClanTitle[]): Promise<void> {
        const cacheKey = TitleCacheKeys.CLAN_TITLES(clanId);
        await RedisCacheManager.set(cacheKey, clanTitles, TitleCacheExpiration.CLAN_TITLES);
    }

    /**
     * 从缓存获取战队头衔
     * @param clanId 战队ID
     * @returns 战队头衔列表
     */
    static async getClanTitlesFromCache(clanId: string): Promise<IClanTitle[] | undefined> {
        const cacheKey = TitleCacheKeys.CLAN_TITLES(clanId);
        return RedisCacheManager.get<IClanTitle[]>(cacheKey);
    }

    /**
     * 缓存头衔统计
     * @param stats 统计信息
     */
    static async cacheTitleStats(stats: Record<string, unknown>): Promise<void> {
        await RedisCacheManager.set(TitleCacheKeys.TITLE_STATS, stats, TitleCacheExpiration.TITLE_STATS);
    }

    /**
     * 从缓存获取头衔统计
     * @returns 统计信息
     */
    static async getTitleStatsFromCache(): Promise<Record<string, unknown> | undefined> {
        return RedisCacheManager.get<Record<string, unknown>>(TitleCacheKeys.TITLE_STATS);
    }

    /**
     * 刷新所有相关缓存
     * @param title 头衔对象
     */
    static async refreshAllCaches(title: ITitle): Promise<void> {
        // 缓存头衔详情
        await this.cacheTitle(title);
        
        // 使分类缓存失效
        await this.invalidateCategoryCaches(title);
        
        // 删除热门头衔缓存
        await this.deleteTitleListCache(TitleCacheKeys.POPULAR_TITLES);
        
        // 删除头衔统计缓存
        await this.deleteTitleListCache(TitleCacheKeys.TITLE_STATS);
        
        // 删除限时或永久头衔缓存
        if (title.isTimeLimited) {
            await this.deleteTitleListCache(TitleCacheKeys.TIME_LIMITED_TITLES);
        } else {
            await this.deleteTitleListCache(TitleCacheKeys.PERMANENT_TITLES);
        }
    }

    /**
     * 使分类缓存失效
     * @param title 头衔对象
     */
    static async invalidateCategoryCaches(title: ITitle): Promise<void> {
        // 删除按类型缓存
        const typeCacheKey = TitleCacheKeys.TITLES_BY_TYPE(title.type);
        await this.deleteTitleListCache(typeCacheKey);
        
        // 删除按稀有度缓存
        const rarityCacheKey = TitleCacheKeys.TITLES_BY_RARITY(title.rarity);
        await this.deleteTitleListCache(rarityCacheKey);
    }

    /**
     * 删除头衔列表缓存
     * @param key 缓存键
     */
    static async deleteTitleListCache(key: string): Promise<void> {
        await RedisCacheManager.del(key);
    }

    /**
     * 批量删除缓存
     * @param keys 缓存键列表
     */
    static async batchDeleteCaches(keys: string[]): Promise<void> {
        if (!keys || keys.length === 0) {
            return;
        }
        
        await Promise.all(keys.map((key) => RedisCacheManager.del(key)));
    }

    /**
     * 清除所有头衔相关缓存
     */
    static async clearAllCaches(): Promise<void> {
        const pattern = "title:*";
        
        try {
            // 获取所有匹配的键
            const redis = (await import("../../config/redis")).default;
            let cursor = "0";
            let allKeys: string[] = [];
            
            do {
                const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 1000);
                cursor = newCursor;
                allKeys = allKeys.concat(keys);
            } while (cursor !== "0");
            
            // 删除所有键
            const uniqueKeys = [...new Set(allKeys)];
            if (uniqueKeys.length > 0) {
                await Promise.all(uniqueKeys.map((key) => RedisCacheManager.del(key)));
                console.log("Title缓存已清除");
            }
        } catch (error) {
            console.error("清除Title缓存失败:", error);
        }
    }

    /**
     * 预热缓存
     * @param titles 头衔列表
     */
    static async warmupCache(titles: ITitle[]): Promise<void> {
        console.log("开始预热Title缓存...");
        
        // 缓存每个头衔
        for (const title of titles) {
            await this.cacheTitle(title);
        }
        
        // 按类型和稀有度分组
        const typeMap = new Map<string, ITitle[]>();
        const rarityMap = new Map<string, ITitle[]>();
        const timeLimitedTitles: ITitle[] = [];
        const permanentTitles: ITitle[] = [];
        
        titles.forEach((title) => {
            // 按类型分组
            if (!typeMap.has(title.type)) {
                typeMap.set(title.type, []);
            }
            typeMap.get(title.type)?.push(title);
            
            // 按稀有度分组
            if (!rarityMap.has(title.rarity)) {
                rarityMap.set(title.rarity, []);
            }
            rarityMap.get(title.rarity)?.push(title);
            
            // 按限时性分组
            if (title.isTimeLimited) {
                timeLimitedTitles.push(title);
            } else {
                permanentTitles.push(title);
            }
        });
        
        // 缓存类型分组
        for (const [type, typeTitles] of typeMap) {
            const cacheKey = TitleCacheKeys.TITLES_BY_TYPE(type);
            await this.cacheTitleList(cacheKey, typeTitles);
        }
        
        // 缓存稀有度分组
        for (const [rarity, rarityTitles] of rarityMap) {
            const cacheKey = TitleCacheKeys.TITLES_BY_RARITY(rarity);
            await this.cacheTitleList(cacheKey, rarityTitles);
        }
        
        // 缓存限时和永久头衔
        await this.cacheTitleList(TitleCacheKeys.TIME_LIMITED_TITLES, timeLimitedTitles);
        await this.cacheTitleList(TitleCacheKeys.PERMANENT_TITLES, permanentTitles);
        
        // 缓存热门头衔（按稀有度和创建时间排序）
        const popularTitles = [...titles]
            .sort((a, b) => {
                const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            })
            .slice(0, 20);
        await this.cacheTitleList(TitleCacheKeys.POPULAR_TITLES, popularTitles);
        
        console.log("Title缓存预热完成");
    }
}