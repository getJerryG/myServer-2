import app from "./api";
import express from "express";

// 静态资源
app.use("/userAvatars", express.static("public/images/userAvatars"));
app.use("/ad", express.static("public/images/ad"));
app.use("/clan", express.static("public/images/clan"));

// 初始化货币系统
async function initCurrencySystem() {
    try {
        const WalletMigrationService = (await import("./models/currency/services/walletMigrationService")).default;
        await WalletMigrationService.initCurrencySystem();
    } catch (error) {
        console.error("初始化货币系统失败:", error);
    }
}

// 预热缓存
setTimeout(async () => {
    try {
        await initCurrencySystem();

        const { default: cacheWarmupManager } = await import("./utils/cacheWarmup");
        await cacheWarmupManager.execute();
        // 启动热点数据更新任务
        cacheWarmupManager.startHotDataUpdateTask();
    } catch (error) {
        console.error("缓存预热失败:", error);
    }
}, 5000);

export default app;