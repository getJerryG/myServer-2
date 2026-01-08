/**
 * 缓存一致性管理器
 */

import redisCache from './redisCache';
import redis from '../config/redis';

// 缓存键常量
export const CACHE_KEYS = {
    USER_INFO: 'user:info',
    USER_STATS: 'user:stats',
    TITLE_INFO: 'title:info',
    TITLE_LIST: 'title:list',
    TITLE_STATS: 'title:stats'
};

// 缓存版本常量
export const CACHE_VERSION = {
    USER: 'v1',
    TITLE: 'v1'
};

/**
 * 生成缓存键
 * @param cacheKey 基础缓存键
 * @param params 参数对象
 * @param version 版本号
 * @returns 完整的缓存键
 */
export function generateCacheKey(cacheKey: string, params: Record<string, string | number>, version?: string): string {
    const paramStr = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join(':');
    
    const versionStr = version ? `:${version}` : '';
    
    return paramStr ? `${cacheKey}:${paramStr}${versionStr}` : `${cacheKey}${versionStr}`;
}

/**
 * 缓存一致性管理器类
 */
export class CacheConsistencyManager {
    /**
     * 更新缓存
     * @param cacheKey 基础缓存键
     * @param params 参数对象
     * @param data 要缓存的数据
     * @param version 版本号
     * @returns 是否成功
     */
    static async updateCache<T>(
        cacheKey: string,
        params: Record<string, string | number>,
        data: T,
        version?: string
    ): Promise<boolean> {
        try {
            const key = generateCacheKey(cacheKey, params, version);
            return await redisCache.set(key, data);
        } catch (error) {
            console.error('Error updating cache:', error);
            return false;
        }
    }

    /**
     * 使缓存失效
     * @param cacheKey 基础缓存键
     * @param params 参数对象
     * @param version 版本号
     * @returns 是否成功
     */
    static async invalidateCache(
        cacheKey: string,
        params: Record<string, string | number>,
        version?: string
    ): Promise<boolean> {
        try {
            const key = generateCacheKey(cacheKey, params, version);
            const result = await redisCache.del(key);
            return result > 0;
        } catch (error) {
            console.error('Error invalidating cache:', error);
            return false;
        }
    }

    /**
     * 批量使缓存失效
     * @param cacheKey 基础缓存键
     * @param paramsList 参数对象列表
     * @param version 版本号
     * @returns 失效的缓存数量
     */
    static async batchInvalidateCache(
        cacheKey: string,
        paramsList: Record<string, string | number>[],
        version?: string
    ): Promise<number> {
        try {
            let invalidatedCount = 0;
            
            for (const params of paramsList) {
                const key = generateCacheKey(cacheKey, params, version);
                const success = await redisCache.del(key);
                if (success) {
                    invalidatedCount++;
                }
            }
            
            return invalidatedCount;
        } catch (error) {
            console.error('Error batch invalidating cache:', error);
            return 0;
        }
    }

    /**
     * 使所有相关缓存失效
     * @param cacheKey 基础缓存键
     * @param version 版本号
     * @returns 失效的缓存数量
     */
    static async invalidateAllRelatedCache(
        cacheKey: string,
        version?: string
    ): Promise<number> {
        try {
            const pattern = version ? `${cacheKey}:*:${version}` : `${cacheKey}:*`;
            // 实现通过模式删除缓存的功能
            let invalidatedCount = 0;
            let cursor = "0";
            
            do {
                // 使用redis.scan获取匹配的键
                const [newCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 1000);
                cursor = newCursor;
                
                if (keys.length > 0) {
                    // 删除匹配的键
                    const result = await redis.del(...keys);
                    invalidatedCount += result;
                }
            } while (cursor !== "0");
            
            return invalidatedCount;
        } catch (error) {
            console.error('Error invalidating all related cache:', error);
            return 0;
        }
    }

    /**
     * 同步缓存
     * @param cacheKey 基础缓存键
     * @param params 参数对象
     * @param fetchData 获取数据的函数
     * @param version 版本号
     * @returns 缓存的数据
     */
    static async syncCache<T>(
        cacheKey: string,
        params: Record<string, string | number>,
        fetchData: () => Promise<T>,
        version?: string
    ): Promise<T | undefined> {
        try {
            const key = generateCacheKey(cacheKey, params, version);
            
            // 尝试从缓存获取数据
            const cachedData = await redisCache.get<T>(key);
            if (cachedData) {
                return cachedData;
            }
            
            // 缓存不存在，从数据源获取
            const data = await fetchData();
            if (!data) {
                return undefined;
            }
            
            // 存入缓存
            await redisCache.set(key, data);
            return data;
        } catch (error) {
            console.error('Error syncing cache:', error);
            return undefined;
        }
    }

    /**
     * 预加载缓存
     * @param cacheKey 基础缓存键
     * @param paramsList 参数对象列表
     * @param fetchData 获取数据的函数
     * @param version 版本号
     * @returns 预加载的缓存数量
     */
    static async preloadCache<T>(
        cacheKey: string,
        paramsList: Record<string, string | number>[],
        fetchData: (params: Record<string, string | number>) => Promise<T>,
        version?: string
    ): Promise<number> {
        try {
            let preloadedCount = 0;
            
            for (const params of paramsList) {
                const data = await fetchData(params);
                if (data) {
                    const success = await this.updateCache(cacheKey, params, data, version);
                    if (success) {
                        preloadedCount++;
                    }
                }
            }
            
            return preloadedCount;
        } catch (error) {
            console.error('Error preloading cache:', error);
            return 0;
        }
    }

    /**
     * 用户缓存管理
     */
    static userCache = {
        /**
         * 更新用户信息缓存
         * @param userId 用户ID
         * @param userData 用户数据
         * @returns 是否成功
         */
        async updateUserInfoCache(userId: number, userData: any): Promise<boolean> {
            return CacheConsistencyManager.updateCache(
                CACHE_KEYS.USER_INFO,
                { userId },
                userData,
                CACHE_VERSION.USER
            );
        },

        /**
         * 使用户信息缓存失效
         * @param userId 用户ID
         * @returns 是否成功
         */
        async invalidateUserInfoCache(userId: number): Promise<boolean> {
            return CacheConsistencyManager.invalidateCache(
                CACHE_KEYS.USER_INFO,
                { userId },
                CACHE_VERSION.USER
            );
        },

        /**
         * 批量使用户信息缓存失效
         * @param userIds 用户ID列表
         * @returns 失效的缓存数量
         */
        async batchInvalidateUserCache(userIds: number[]): Promise<number> {
            const paramsList = userIds.map((userId) => ({ userId }));
            return CacheConsistencyManager.batchInvalidateCache(
                CACHE_KEYS.USER_INFO,
                paramsList,
                CACHE_VERSION.USER
            );
        }
    };

    /**
     * 头衔缓存管理
     */
    static titleCache = {
        /**
         * 更新头衔信息缓存
         * @param titleId 头衔ID
         * @param titleData 头衔数据
         * @returns 是否成功
         */
        async updateTitleInfoCache(titleId: string, titleData: any): Promise<boolean> {
            return CacheConsistencyManager.updateCache(
                CACHE_KEYS.TITLE_INFO,
                { titleId },
                titleData,
                CACHE_VERSION.TITLE
            );
        },

        /**
         * 使头衔信息缓存失效
         * @param titleId 头衔ID
         * @returns 是否成功
         */
        async invalidateTitleInfoCache(titleId: string): Promise<boolean> {
            return CacheConsistencyManager.invalidateCache(
                CACHE_KEYS.TITLE_INFO,
                { titleId },
                CACHE_VERSION.TITLE
            );
        },

        /**
         * 使头衔列表缓存失效
         * @returns 是否成功
         */
        async invalidateTitleListCache(): Promise<boolean> {
            return CacheConsistencyManager.invalidateCache(
                CACHE_KEYS.TITLE_LIST,
                {},
                CACHE_VERSION.TITLE
            );
        },

        /**
         * 使头衔统计缓存失效
         * @returns 是否成功
         */
        async invalidateTitleStatsCache(): Promise<number> {
            return CacheConsistencyManager.invalidateCache(
                CACHE_KEYS.TITLE_STATS,
                {},
                CACHE_VERSION.TITLE
            ) ? 1 : 0;
        },

        /**
         * 批量使头衔缓存失效
         * @param titleIds 头衔ID列表
         * @returns 失效的缓存数量
         */
        async batchInvalidateTitleCache(titleIds: string[]): Promise<number> {
            const paramsList = titleIds.map((titleId) => ({ titleId }));
            const invalidatedCount = await CacheConsistencyManager.batchInvalidateCache(
                CACHE_KEYS.TITLE_INFO,
                paramsList,
                CACHE_VERSION.TITLE
            );
            
            // 同时使头衔列表和统计缓存失效
            await CacheConsistencyManager.titleCache.invalidateTitleListCache();
            await CacheConsistencyManager.titleCache.invalidateTitleStatsCache();
            
            return invalidatedCount + 2;
        }
    };
}

export default CacheConsistencyManager;
