import express, { Request, Response, Router } from "express";
import Cache from "@/utils/cache";
import path from "path";

const router: Router = express.Router();

// 获取图片列表
router.get("/", async (req: Request, res: Response) => {
    try {
        // 从缓存获取图片路径
        const imagePaths = Cache.get("imagePaths");
        
        if (imagePaths) {
            resSuccess(res, imagePaths, "获取图片列表成功");
            return;
        }
        
        // 如果缓存中没有，从文件系统读取
        const targetDirectory = path.join("public", "images", "ad");
        
        // 异步查找图片路径的函数
        const findImagePathsAsync = async (_directory: string): Promise<string[]> => {
            // 实现异步查找图片路径的逻辑
            return [];
        };
        
        const imagePathsFromDisk = await findImagePathsAsync(targetDirectory);
        
        // 缓存结果
        Cache.set("imagePaths", imagePathsFromDisk, 60 * 60);
        
        resSuccess(res, imagePathsFromDisk, "获取图片列表成功");
    } catch (_error) {
        resError(res, 500, "获取图片列表失败");
    }
});

// 辅助函数：成功响应
function resSuccess(res: Response, data: Record<string, unknown>, message: string) {
    res.json({ success: true, data, message });
}

// 辅助函数：错误响应
function resError(res: Response, code: number, message: string) {
    res.status(code).json({ success: false, message });
}

export default router;