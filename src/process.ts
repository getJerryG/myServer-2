import ThreadPool from "./core/ThreadPool";
import { connection } from "mongoose";

// 初始化线程池
const threadPool = ThreadPool.getInstance();

// 监听任务更新事件
threadPool.on("taskUpdate", (task) => {
    console.log(`任务更新: [ ${task.id} ]: ${task.status}`);
});

// 优雅关闭处理
process.on("SIGINT", async () => {
    console.log("收到 SIGINT 信号，正在优雅关闭...");
    
    try {
        // 关闭线程池
        await threadPool.shutdown();
        
        // 关闭数据库连接
        await connection.close();
        
        console.log("优雅关闭完成");
        process.exit(0);
    } catch (error) {
        console.error("优雅关闭过程中发生错误:", error);
        process.exit(1);
    }
});

process.on("SIGTERM", async () => {
    console.log("收到 SIGTERM 信号，正在优雅关闭...");
    
    try {
        // 关闭线程池
        await threadPool.shutdown();
        
        // 关闭数据库连接
        await connection.close();
        
        console.log("优雅关闭完成");
        process.exit(0);
    } catch (error) {
        console.error("优雅关闭过程中发生错误:", error);
        process.exit(1);
    }
});

// 未捕获异常处理
process.on("uncaughtException", (error) => {
    console.error("未捕获的异常:", error);
    process.exit(1);
});