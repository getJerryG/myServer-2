// 测试自动状态更新功能
import ContestAutoStatusUpdateService from "../models/contest/services/ContestAutoStatusUpdateService";

/**
 * 测试自动状态更新功能
 */
async function testAutoStatusUpdate(): Promise<void> {
    try {
        console.log("=== 测试自动状态更新功能 ===");
        
        // 调用状态更新服务，立即执行一次状态更新
        console.log("1. 执行立即状态更新...");
        await ContestAutoStatusUpdateService.updateAllStatuses();
        
        console.log("2. 状态更新完成，检查日志以确认更新结果");
        
        console.log("\n=== 测试完成 ===");
    } catch (error) {
        console.error("测试自动状态更新功能失败:", error);
    }
}

// 运行测试
testAutoStatusUpdate();