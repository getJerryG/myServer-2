import Redis from "ioredis";

/**
 * Redis 布隆过滤器实现
 * 用于高效判断一个元素是否在集合中，误判率可配置
 */
export class BloomFilter {
    private redis: Redis;
    private key: string;
    private size: number;
    private hashCount: number;

    /**
     * 构造函数
     * @param redis - Redis客户端实例
     * @param key - Redis中存储布隆过滤器的键名
     * @param expectedElements - 预期元素数量（默认100万）
     * @param errorRate - 期望误判率（默认0.01%）
     */
    constructor(redis: Redis, key: string, expectedElements = 1000000, errorRate = 0.0001) {
        this.redis = redis;
        this.key = key;
        this.size = this.calculateSize(expectedElements, errorRate);
        this.hashCount = this.calculateHashCount(this.size, expectedElements);
    }

    /**
     * 计算布隆过滤器大小
     * @param n - 预期元素数量
     * @param p - 期望误判率
     */
    private calculateSize(n: number, p: number): number {
        return Math.ceil((-n * Math.log(p)) / Math.pow(Math.log(2), 2));
    }

    /**
     * 计算所需哈希函数数量
     * @param m - 布隆过滤器大小
     * @param n - 预期元素数量
     */
    private calculateHashCount(m: number, n: number): number {
        return Math.ceil((m / n) * Math.log(2));
    }

    /**
     * 哈希函数
     * @param value - 要哈希的值
     * @param seed - 哈希种子
     */
    private hash(value: string, seed: number): number {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = seed * hash + value.charCodeAt(i);
        }
        return Math.abs(hash % this.size);
    }

    /**
     * 添加元素到布隆过滤器
     * @param value - 要添加的元素
     */
    async add(value: string): Promise<void> {
        const pipeline = this.redis.pipeline();
        for (let i = 0; i < this.hashCount; i++) {
            const position = this.hash(value, i);
            pipeline.setbit(this.key, position, 1);
        }
        await pipeline.exec();
    }

    /**
     * 判断元素是否可能存在于布隆过滤器中
     * @param value - 要检查的元素
     * @returns - 如果可能存在返回true，否则返回false
     */
    async exists(value: string): Promise<boolean> {
        const pipeline = this.redis.pipeline();
        for (let i = 0; i < this.hashCount; i++) {
            const position = this.hash(value, i);
            pipeline.getbit(this.key, position);
        }
        const results = await pipeline.exec();
        return results.every(([_, bit]) => bit === 1);
    }

    /**
     * 批量添加元素到布隆过滤器
     * @param values - 要添加的元素数组
     */
    async addBatch(values: string[]): Promise<void> {
        for (const value of values) {
            await this.add(value);
        }
    }

    /**
     * 清空布隆过滤器
     */
    async clear(): Promise<void> {
        await this.redis.del(this.key);
    }
}