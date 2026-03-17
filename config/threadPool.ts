/**
 * Thread Pool Configuration
 */
import os from "os";

export const ThreadPoolConfig = {
    /** CPU 最大工作线程数 */
    MAX_WORKERS: os.cpus().length,

    /** 最大队列大小 */
    MAX_QUEUE_SIZE: 100,

    /** Worker 文件路径 */
    WORKER_FILE: "./src/core/WorkerHandler.ts",

    /** Worker 超时时间 */
    WORKER_TIMEOUT: 30_000,

    /** 是否自动清理 */
    AUTO_CLEANUP: true,

    /** 日志配置 */
    LOG_CONFIG: {
        ENABLE: true,
        LEVEL: "info", // debug | info | warn | error
        PATH: "./logs/thread_pool.log"
    }
};
