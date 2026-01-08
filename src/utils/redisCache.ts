import redis from "../config/redis";
import { BloomFilter } from "./bloomFilter";
import { DistributedLock } from "./distributedLock";

/**
 * Redis CacheManager
 */
export default class RedisCacheManager {
    private static metrics = {
        hitCount: 0,
        missCount: 0,
        setCount: 0,
        delCount: 0,
        getCount: 0,
        errorCount: 0,
        startTime: Date.now()
    };
    
    private static bloomFilter: BloomFilter = new BloomFilter(redis, "bloom:filter", 1000000, 0.0001);
    private static distributedLock: DistributedLock = new DistributedLock(redis, "lock:", 2000);
    
    /**
     * Get cache metrics
     */
    public static getMetrics() {
        const total = this.metrics.hitCount + this.metrics.missCount;
        const hitRate = total === 0 ? 0 : parseFloat(((this.metrics.hitCount / total) * 100).toFixed(2));
        const uptime = Date.now() - this.metrics.startTime;
        
        return {
            ...this.metrics,
            hitRate,
            uptime,
            timestamp: Date.now()
        };
    }
    
    /**
     * Reset cache metrics
     */
    public static resetMetrics(): void {
        this.metrics = {
            hitCount: 0,
            missCount: 0,
            setCount: 0,
            delCount: 0,
            getCount: 0,
            errorCount: 0,
            startTime: Date.now()
        };
    }
    
    /**
     * Get bloom filter instance
     */
    public static getBloomFilter(): BloomFilter {
        return this.bloomFilter;
    }
    
    /**
     * Get distributed lock instance
     */
    public static getDistributedLock(): DistributedLock {
        return this.distributedLock;
    }
    
    /**
     * Scan keys with pattern
     * @param pattern - Redis key pattern
     */
    private static async scanKeys(pattern = "*"): Promise<string[]> {
        const keys: string[] = [];
        let cursor = "0";
        
        do {
            const [newCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 1000);
            cursor = newCursor;
            keys.push(...foundKeys);
        } while (cursor !== "0");
        
        return keys;
    }
    
    /**
     * Set cache value
     * @param key - Redis key
     * @param value - Value to cache
     * @param ttl - Time to live in seconds
     * @param enableRandomTTL - Whether to enable random TTL offset
     */
    public static async set<T>(key: string, value: T, ttl?: number, enableRandomTTL = true): Promise<boolean> {
        try {
            const serializedValue = JSON.stringify(value);
            
            if (ttl) {
                await redis.setex(key, ttl, serializedValue);
            } else {
                await redis.set(key, serializedValue);
            }
            
            await this.bloomFilter.add(key);
            this.metrics.setCount++;
            
            return true;
        } catch (error) {
            console.error(`Failed to set cache for ${key}:`, error);
            this.metrics.errorCount++;
            return false;
        }
    }
    
    /**
     * Get cache value
     * @param key - Redis key
     * @param enableBloomFilter - Whether to use bloom filter
     */
    public static async get<T>(key: string, enableBloomFilter = true): Promise<T | undefined> {
        try {
            this.metrics.getCount++;
            
            const value = await redis.get(key);
            
            if (!value || value === "__EMPTY__") {
                this.metrics.missCount++;
                return undefined;
            }
            
            this.metrics.hitCount++;
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Failed to get cache for ${key}:`, error);
            this.metrics.errorCount++;
            this.metrics.missCount++;
            return undefined;
        }
    }
    
    /**
     * Delete cache key
     * @param key - Redis key
     */
    public static async del(key: string): Promise<number> {
        try {
            const count = await redis.del(key);
            this.metrics.delCount++;
            return count;
        } catch (error) {
            console.error(`Failed to delete cache for ${key}:`, error);
            this.metrics.errorCount++;
            return 0;
        }
    }
    
    /**
     * Flush all cache
     */
    public static async flushAll(): Promise<void> {
        try {
            await redis.flushall();
        } catch (error) {
            console.error("Failed to flush all cache:", error);
            throw new Error(`Failed to flush cache: ${(error as Error).message}`);
        }
    }
}