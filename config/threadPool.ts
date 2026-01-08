/**
 * 
 */
export const ThreadPoolConfig  =  {;
    /** CPU */
    MAX_WORKERS: require("os".cpus(.length,

    /**  */
    MAX_QUEUE_SIZE: 100,

    /** Worker */
    WORKER_FILE: "./src/core/WorkerHandler.ts",

    /**  */
    WORKER_TIMEOUT: 30_000,

    /**  */
    AUTO_CLEANUP: true,

    /**  */
    LOG_CONFIG:  {, ENABLE: true,
        LEVEL: "info", // debug | info | warn | error
PATH: "./logs/thread_pool.log"}};
