import cache from "node-cache";

// 创建缓存实例
const myCache = new cache({
    stdTTL: 3600, // 默认过期时间（秒）
    checkperiod: 120 // 检查过期时间的周期（秒）
});

/**
 * 本地缓存管理器
 */
export class CacheManager {
    /**
     * 设置缓存值
     * @param key - 缓存键
     * @param value - 缓存值
     * @param ttl - 过期时间（秒）
     */
    public static set<T>(key: string, value: T, ttl?: number): boolean {
        try {
            return myCache.set(key, value, ttl);
        } catch (error) {
            throw new Error(`Failed to set cache for ${key}: ${(error as Error).message}`);
        }
    }
    
    /**
     * 获取缓存值
     * @param key - 缓存键
     */
    public static get<T>(key: string): T | undefined {
        try {
            return myCache.get<T>(key);
        } catch (error) {
            throw new Error(`Failed to get cache for ${key}: ${(error as Error).message}`);
        }
    }
    
    /**
     * 获取所有缓存值
     */
    public static getAll<T>(): T[] {
        try {
            const keys = myCache.keys();
            const values = keys.map((key) => myCache.get<T>(key));
            return values.filter((value): value is T => value !== undefined);
        } catch (error) {
            throw new Error(`Failed to get all cache: ${(error as Error).message}`);
        }
    }
    
    /**
     * 根据键模式获取缓存值列表
     * @param key_role - 键模式（字符串或正则表达式）
     */
    public static getlist<T>(key_role: string | RegExp): T[] {
        const keys = myCache.keys();
        const regex = typeof key_role === "string" ? new RegExp(key_role) : key_role;
        const values = keys
            .filter((key) => regex.test(key))
            .map((key) => myCache.get<T>(key));
        return values.filter((value): value is T => value !== undefined);
    }
    
    /**
     * 删除缓存键
     * @param key - 缓存键
     */
    public static del(key: string): number {
        try {
            return myCache.del(key);
        } catch (error) {
            throw new Error(`Failed to delete cache for ${key}: ${(error as Error).message}`);
        }
    }
    
    /**
     * 清空所有缓存
     */
    public static flushAll(): void {
        try {
            myCache.flushAll();
        } catch (error) {
            throw new Error(`Failed to flush all cache: ${(error as Error).message}`);
        }
    }
}

export default CacheManager;