/**
 * 重试包装器工具
 */

// 重试配置接口
export interface RetryConfig {
    maxRetries: number;
    delay: number;
    backoff: boolean;
    onRetry?: (attempt: number, error: Error) => void;
}

// 默认重试配置
const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoff: false
};

/**
 * 带重试功能的函数包装器
 * @param fn 要包装的函数
 * @param config 重试配置
 * @returns 包装后的函数
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, config?: Partial<RetryConfig>): T {
    // 合并配置
    const retryConfig: RetryConfig = {
        ...defaultRetryConfig,
        ...config
    };

    // 返回包装后的函数
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        let lastError: Error;

        // 重试循环
        for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
            try {
                // 执行原函数
                return await fn(...args) as ReturnType<T>;
            } catch (error) {
                lastError = error as Error;
                
                // 如果不是最后一次尝试，进行重试
                if (attempt < retryConfig.maxRetries) {
                    // 调用重试回调
                    if (retryConfig.onRetry) {
                        retryConfig.onRetry(attempt + 1, lastError);
                    }
                    
                    // 计算延迟时间
                    const delay = retryConfig.backoff 
                        ? retryConfig.delay * Math.pow(2, attempt) 
                        : retryConfig.delay;
                    
                    // 等待延迟
                    await new Promise<void>((resolve) => setTimeout(resolve, delay));
                }
            }
        }
        
        // 所有重试都失败，抛出最后一次错误
        throw lastError;
    }) as T;
}

/**
 * 带重试功能的定时任务包装器
 * @param rule 定时任务规则
 * @param fn 要执行的函数
 * @param config 重试配置
 * @returns 定时任务实例
 */
export function withRetrySchedule(rule: Record<string, unknown>, fn: () => Promise<void>, config?: Partial<RetryConfig>) {
    // 导入node-schedule模块
    const schedule = require("node-schedule");
    
    // 包装函数
    const wrappedFn = withRetry(fn, config);
    
    // 创建定时任务
    return schedule.scheduleJob(rule, wrappedFn);
}
