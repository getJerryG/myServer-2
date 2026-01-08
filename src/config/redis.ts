/**
 * Redis配置
 * 根据环境变量NODE_ENV区分开发环境和生产环境
 */

import Redis from "ioredis";
import { RedisOptions } from "ioredis";

// 获取当前环境
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * 开发环境Redis配置
 * 连接本地Redis服务器，使用默认连接参数
 */
const devRedisConfig: RedisOptions = {
    // Redis服务器地址 - 本地开发环境使用localhost
    host: "localhost",
    // Redis服务器端口 - 本地默认端口6379
    port: 6379,
    // Redis密码 - 本地开发环境通常不设置密码
    password: undefined,
    // 数据库索引 - 开发环境使用默认数据库0
    db: 0,
    // 连接超时时间 - 开发环境设置较短的超时时间
    connectTimeout: 3000,
    // 重试策略 - 开发环境重试间隔较短
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 300, 3000);
        return delay;
    },
    // 重连尝试次数 - 开发环境减少重试次数
    maxRetriesPerRequest: 5,
    // 保持连接
    keepAlive: 5000,
    // 启用Ready检查
    enableReadyCheck: true,
    // 启用重连错误事件
    enableOfflineQueue: true,
    // 发送命令前的检查
    lazyConnect: false,

    // TLS配置 - 开发环境不使用TLS
    tls: undefined,
    // 家族
    family: 4,

    // 自动重连配置
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true
};

/**
 * 生产环境Redis配置
 * 从环境变量读取配置，确保生产环境的安全性
 */
const prodRedisConfig: RedisOptions = {
    // Redis服务器地址
    host: process.env.REDIS_HOST || "localhost",
    // Redis服务器端口
    port: parseInt(process.env.REDIS_PORT as string) || 6379,
    // Redis密码
    password: process.env.REDIS_PASSWORD || undefined,
    // 数据库索引
    db: parseInt(process.env.REDIS_DB as string) || 0,
    // 连接超时时间
    connectTimeout: 5000,
    // 重试策略
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 500, 5000);
        return delay;
    },
    // 重连尝试次数
    maxRetriesPerRequest: 10,
    // 保持连接
    keepAlive: 10000,
    // 启用Ready检查
    enableReadyCheck: true,
    // 启用重连错误事件
    enableOfflineQueue: true,
    // 发送命令前的检查
    lazyConnect: false,

    // TLS配置 - 生产环境可根据需要配置TLS
    tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
    // 家族
    family: 4,

    // 自动重连配置
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true
};

// 根据环境选择对应的Redis配置
const redisConfig = NODE_ENV === "production" ? prodRedisConfig : devRedisConfig;

// 创建Redis实例
const redis = new Redis(redisConfig);

// 添加Promise接口，用于等待Redis连接成功
let redisConnected = false;
let redisConnectPromise: Promise<void>;
let resolveRedisConnect: () => void;
let rejectRedisConnect: (error: Error) => void;

// 初始化Promise
redisConnectPromise = new Promise((resolve, reject) => {
    resolveRedisConnect = resolve;
    rejectRedisConnect = reject;
});

// 监听连接事件
redis.on("connect", () => {
    console.log(`[Redis] 连接成功，环境: ${NODE_ENV}`);
    console.log(`[Redis] 服务器地址: ${redisConfig.host}:${redisConfig.port}`);
    console.log(`[Redis] 数据库索引: ${redisConfig.db}`);
    redisConnected = true;
    resolveRedisConnect();
});

// 监听错误事件
redis.on("error", (error) => {
    console.error(`[Redis] 连接错误，环境: ${NODE_ENV}`);
    console.error(`[Redis] 错误信息: ${error.message}`);
    if (!redisConnected) {
        rejectRedisConnect(error);
    }
});

// 监听断开连接事件
redis.on("close", () => {
    console.log(`[Redis] 连接断开，环境: ${NODE_ENV}`);
    redisConnected = false;
});

// 监听重连事件
redis.on("reconnecting", (info) => {
    console.log(`[Redis] 正在重连，环境: ${NODE_ENV}`);
    console.log(`[Redis] 重连尝试次数: ${info.attempt}`);
    console.log(`[Redis] 重连延迟: ${info.delay}ms`);
});

// 等待Redis连接成功的函数
async function waitForRedisConnection() {
    if (redisConnected) {
        return;
    }
    await redisConnectPromise;
}

export default redis;
export { redisConfig, waitForRedisConnection };