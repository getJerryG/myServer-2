import redis from "../config/redis";

/**
 * 缓存预热任务接口
 */
export interface WarmupTask {
    /**
     * 任务名称
     */
    name: string;
    /**
     * 执行函数
     */
    execute: () => Promise<void>;
    /**
     * 优先级 0-100
     */
    priority?: number;
}

/**
 * 热点数据检测器
 */
export class HotDataDetector {
    private accessLogKey = "access:log";
    private hotDataKey = "hot:data";

    /**
     * 记录访问
     * @param key 访问的键
     */
    async recordAccess(key: string): Promise<void> {
        // 使用Sorted Set记录访问次数
        await redis.zincrby(this.accessLogKey, 1, key);
    }

    /**
     * 检测热点数据
     * @param topN 取前N个热点数据，默认1000
     */
    async detectHotData(topN = 1000): Promise<string[]> {
        // 获取topN个访问量最高的键
        const hotKeys = await redis.zrevrange(this.accessLogKey, 0, topN - 1);

        // 存储热点数据
        await redis.del(this.hotDataKey);
        if (hotKeys.length > 0) {
            await redis.sadd(this.hotDataKey, ...hotKeys);
        }

        // 清空访问日志
        await redis.del(this.accessLogKey);

        return hotKeys;
    }

    /**
     * 获取热点数据
     */
    async getHotData(): Promise<string[]> {
        return redis.smembers(this.hotDataKey);
    }

    /**
     * 检查是否为热点数据
     * @param key 要检查的键
     */
    async isHotData(key: string): Promise<boolean> {
        return (await redis.sismember(this.hotDataKey, key)) === 1;
    }
}

/**
 * 缓存预热管理器
 */
export class CacheWarmupManager {
    private tasks: WarmupTask[] = [];
    private isExecuting = false;
    private hotDataDetector: HotDataDetector;

    /**
     * 构造函数
     */
    constructor() {
        this.hotDataDetector = new HotDataDetector();
    }

    /**
     * 注册预热任务
     * @param task 预热任务
     */
    registerTask(task: WarmupTask): void {
        this.tasks.push({
            priority: 5, // 默认优先级为5
            ...task
        });

        // 按优先级排序，优先级高的先执行
        this.tasks.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    }

    /**
     * 执行所有预热任务
     */
    async execute(): Promise<void> {
        if (this.isExecuting) {
            console.log("预热任务正在执行中，请勿重复调用");
            return;
        }

        console.log("开始执行缓存预热任务...");
        this.isExecuting = true;
        const startTime = Date.now();

        try {
            // 并行执行所有任务
            await Promise.all(this.tasks.map((task) => this.executeTask(task)));

            // 记录预热耗时
            const endTime = Date.now();
            console.log(`缓存预热完成，共执行 ${this.tasks.length} 个任务，耗时 ${endTime - startTime}ms`);
        } catch (error) {
            console.error(`缓存预热执行失败: ${error}`);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * 执行单个预热任务
     * @param task 预热任务
     */
    private async executeTask(task: WarmupTask): Promise<void> {
        console.log(`开始执行预热任务: ${task.name}`);
        const taskStartTime = Date.now();

        try {
            await task.execute();
            const taskEndTime = Date.now();
            console.log(`预热任务 ${task.name} 执行完成，耗时 ${taskEndTime - taskStartTime}ms`);
        } catch (error) {
            console.error(`预热任务 ${task.name} 执行失败:`, error);
        }
    }

    /**
     * 获取热点数据检测器
     */
    getHotDataDetector(): HotDataDetector {
        return this.hotDataDetector;
    }

    /**
     * 启动热点数据更新任务
     * @param interval 更新间隔，单位毫秒，默认1小时
     */
    startHotDataUpdateTask(interval = 3600000): void {
        console.log(`启动热点数据更新任务，更新间隔: ${interval / 1000}秒`);

        // 立即执行一次
        this.updateHotData();

        // 设置定时任务
        setInterval(() => {
            this.updateHotData();
        }, interval);
    }

    /**
     * 更新热点数据
     */
    private async updateHotData(): Promise<void> {
        console.log("开始更新热点数据...");
        const startTime = Date.now();

        try {
            // 检测热点数据
            const hotKeys = await this.hotDataDetector.detectHotData(1000);
            console.log(`热点数据更新完成，共检测到 ${hotKeys.length} 个热点数据`);

            // 这里可以添加热点数据的处理逻辑
        } catch (error) {
            console.error(`热点数据更新失败: ${error}:`, error);
        } finally {
            const endTime = Date.now();
            console.log(`热点数据更新耗时: ${endTime - startTime}ms`);
        }
    }
}

// 创建单例实例
const cacheWarmupManager = new CacheWarmupManager();

export default cacheWarmupManager;