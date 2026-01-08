/**
 * 重试操作工具函数
 */

// 操作类型定义
type Operation<T = unknown> = () => Promise<T>;

/**
 * 重试操作函数
 * @param operation 要执行的异步操作
 * @param maxRetries 最大重试次数，默认3次
 * @param delay 重试间隔，默认1000ms
 * @returns 操作结果
 */
async function retryOperation<T = unknown>(operation: Operation<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let retries = 0;

    while (true) {
        try {
            // 执行操作
            return await operation();
        } catch (error) {
            // 增加重试次数
            retries++;
            
            // 如果超过最大重试次数，抛出错误
            if (retries > maxRetries) {
                throw error;
            }
            
            // 等待指定时间后重试
            await new Promise<void>((resolve) => setTimeout(resolve, delay));
        }
    }
}

export default retryOperation;
