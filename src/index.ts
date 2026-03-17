import app from "./server";
import { createServer } from "http";
import connectToDatabase from "@/config/db";
import { waitForRedisConnection } from "@/config/redis";
// import MyAppServer from "./App";

(async () => {
    try {
        console.log("正在启动服务器...");
        
        // 1. 加载必要模块
        await import("./process"); // 
        await import("@/utils/autoFun/schedule"); // 
        await import("@/utils/autoFun/eventListeners"); //
        
        // 2. 连接数据库并等待成功
        console.log("正在连接数据库...");
        await connectToDatabase();
        
        // 3. 等待Redis连接成功
        console.log("正在等待Redis连接...");
        await waitForRedisConnection();
        
        // 4. 创建HTTP服务器并启动
        const httpServer = createServer(app);
        const port = 3001;
        
        // 监听服务器启动错误
        httpServer.on("error", (error) => {
            console.error("服务器启动错误:", error);
            process.exit(1);
        });
        
        httpServer.listen(port, "127.0.0.1", () => {
            console.log(`服务器已成功启动，运行在 http://127.0.0.1:${port}`);
            console.log("服务器正在运行，按 Ctrl+C 停止...");
        });
        
        // 保持进程运行
        process.on("SIGINT", () => {
            console.log("收到 SIGINT 信号，正在关闭服务器...");
            httpServer.close(() => {
                console.log("服务器已关闭");
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error("服务器启动失败:", error);
        process.exit(1);
    }
})();