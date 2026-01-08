import app from "./server";
import { createServer } from "http";
import connectToDatabase from "@/config/db";
import { waitForRedisConnection } from "@/config/redis";
// import MyAppServer from "./App";

(async () => {
    console.log("正在启动服务器...");
    
    // 1. 加载必要模块
    await import("./test"); // 
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
    httpServer.listen(3000, () => {
        console.log("服务器已成功启动，运行在端口 3000");
    });
})();