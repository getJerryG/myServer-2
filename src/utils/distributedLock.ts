import Redis from "ioredis";

/**
 * Redis 分布式锁实现
 * 使用 SET NX EX 命令实现
 */
export class DistributedLock {
    private redis: Redis;
    private lockPrefix: string;
    private defaultExpireTime: number;
    private renewalTimers = new Map<string, NodeJS.Timeout>();

    /**
     * 构造函数
     * @param redis - Redis客户端实例
     * @param lockPrefix - 锁前缀，默认 'lock:'
     * @param defaultExpireTime - 默认过期时间（秒），默认 2 秒
     */
    constructor(redis: Redis, lockPrefix = "lock:", defaultExpireTime = 2) {
        this.redis = redis;
        this.lockPrefix = lockPrefix;
        this.defaultExpireTime = defaultExpireTime;
    }

    /**
     * 获取锁
     * @param key - 锁的业务键
     * @param expireTime - 过期时间（秒），可选
     * @returns - 锁值（UUID），获取失败返回 null
     */
    async acquire(key: string, expireTime?: number): Promise<string | null> {
        const lockKey = `${this.lockPrefix}${key}`;
        const lockValue = crypto.randomUUID(); // 生成唯一标识
        const expire = expireTime || this.defaultExpireTime;
        
        // Lua脚本：原子性设置锁
        const lockScript = `
            if redis.call("set", KEYS[1], ARGV[1], "NX", "EX", ARGV[2]) then
                return 1;
            else
                return 0;
            end
        `;
        
        const result = await this.redis.eval(lockScript, 1, lockKey, lockValue, expire.toString());
        return result === 1 ? lockValue : null;
    }

    /**
     * 获取锁并自动续约
     * @param key - 锁的业务键
     * @param expireTime - 过期时间（秒）
     * @param renewalInterval - 续约间隔（毫秒），默认 500ms
     * @returns - 锁值（UUID），获取失败返回 null
     */
    async acquireWithRenewal(key: string, expireTime: number, renewalInterval = 500): Promise<string | null> {
        const lockKey = `${this.lockPrefix}${key}`;
        const lockValue = await this.acquire(key, expireTime);
        
        if (!lockValue) {
            return null;
        }
        
        // 设置自动续约定时器
        const renewalTimer = setInterval(async () => {
            try {
                // 检查锁是否仍然有效
                const currentLockValue = await this.redis.get(lockKey);
                if (currentLockValue === lockValue) {
                    // 锁有效，续约
                    await this.redis.expire(lockKey, expireTime);
                } else {
                    // 锁已失效，清除定时器
                    clearInterval(renewalTimer);
                    this.renewalTimers.delete(lockKey);
                }
            } catch (error) {
                console.error(`自动续约锁失败 ${lockKey}:`, error);
                clearInterval(renewalTimer);
                this.renewalTimers.delete(lockKey);
            }
        }, renewalInterval);
        
        this.renewalTimers.set(lockKey, renewalTimer);
        return lockValue;
    }

    /**
     * 释放锁
     * @param key - 锁的业务键
     * @param lockValue - 获取锁时返回的唯一标识
     * @returns - 是否成功释放锁
     */
    async release(key: string, lockValue: string): Promise<boolean> {
        const lockKey = `${this.lockPrefix}${key}`;
        
        // 清除自动续约定时器
        const timer = this.renewalTimers.get(lockKey);
        if (timer) {
            clearInterval(timer);
            this.renewalTimers.delete(lockKey);
        }
        
        // Lua脚本：原子性释放锁
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1]);
            else
                return 0;
            end
        `;
        
        const result = await this.redis.eval(script, 1, lockKey, lockValue);
        return result === 1;
    }

    /**
     * 尝试获取锁
     * @param key - 锁的业务键
     * @param retryTimes - 重试次数，默认 3 次
     * @param retryInterval - 重试间隔（毫秒），默认 100ms
     * @param expireTime - 过期时间（秒），可选
     * @returns - 锁值（UUID），获取失败返回 null
     */
    async tryAcquire(key: string, retryTimes = 3, retryInterval = 100, expireTime?: number): Promise<string | null> {
        for (let i = 0; i < retryTimes; i++) {
            const lockValue = await this.acquire(key, expireTime);
            if (lockValue) {
                return lockValue;
            }
            
            // 重试间隔
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
        
        return null;
    }

    /**
     * 尝试获取锁并自动续约
     * @param key - 锁的业务键
     * @param expireTime - 过期时间（秒）
     * @param retryTimes - 重试次数，默认 3 次
     * @param retryInterval - 重试间隔（毫秒），默认 100ms
     * @param renewalInterval - 续约间隔（毫秒），默认 500ms
     * @returns - 锁值（UUID），获取失败返回 null
     */
    async tryAcquireWithRenewal(
        key: string,
        expireTime: number,
        retryTimes = 3,
        retryInterval = 100,
        renewalInterval = 500
    ): Promise<string | null> {
        for (let i = 0; i < retryTimes; i++) {
            const lockValue = await this.acquireWithRenewal(key, expireTime, renewalInterval);
            if (lockValue) {
                return lockValue;
            }
            
            // 重试间隔
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
        
        return null;
    }
}