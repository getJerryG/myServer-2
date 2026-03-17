import express from "express";
import { resSuccess, resError } from "../utils/res";
import RedisCacheManager from "../utils/redisCache";
import redis from "../config/redis";

const router = express.Router();

/**
 * 获取Redis缓存指标
 */
router.get("/redis/metrics", async (req, res) => {
    try {
        const metrics = RedisCacheManager.getMetrics();
        resSuccess(res, metrics, "获取Redis指标成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "未知错误");
    }
});

/**
 * 获取Redis信息
 */
router.get("/redis/info", async (req, res) => {
    try {
        const info = await redis.info();
        
        const infoObj = info
            .split("\r\n")
            .filter((line) => line && !line.startsWith("#") && line.includes(":"))
            .reduce<Record<string, string>>((acc, line) => {
                const [key, ...valueParts] = line.split(":");
                acc[key] = valueParts.join(":").trim();
                return acc;
            }, {});
        
        resSuccess(res, infoObj, "获取Redis信息成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "未知错误");
    }
});

/**
 * 重置Redis缓存指标
 */
router.post("/redis/reset-metrics", (req, res) => {
    try {
        RedisCacheManager.resetMetrics();
        resSuccess(res, null, "重置Redis指标成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "未知错误");
    }
});

/**
 * 健康检查
 */
router.get("/health", async (req, res) => {
    try {
        // 检查Redis状态
        const redisStatus = redis.status;
        const isRedisHealthy = ["connecting", "connect", "ready"].includes(redisStatus);
        
        resSuccess(res, { 
            status: "ok",
            components: { 
                redis: {
                    status: isRedisHealthy ? "ok" : "error",
                    message: `Redis状态: ${redisStatus}`
                }
            }
        }, "健康检查成功");
    } catch (error) {
        resError(res, 500, `健康检查失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
});

export default router;