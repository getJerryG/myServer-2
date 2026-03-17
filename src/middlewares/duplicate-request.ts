import { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import RedisCacheManager from "../utils/redisCache";

/**
 * 生成请求唯一标识
 * @param req - Express请求对象
 * @returns 请求唯一标识字符串
 */
function generateRequestIdentifier(req: Request): string {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const data = `${req.ip}${req.url}${token}`;
    return createHash("sha256").update(data).digest("hex");
}

/**
 * 防止重复请求中间件
 * @param req - Express请求对象
 * @param res - Express响应对象
 * @param next - Express下一步函数
 */
const duplicateRequestMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identifier = generateRequestIdentifier(req);
    
    try {
        const exists = await RedisCacheManager.get(identifier);
        
        if (exists) {
            console.log(`Duplicate request detected: ${identifier}`);
            res.status(400).json({
                statusCode: 400,
                message: "请勿重复请求"
            });
            return;
        }
        
        await RedisCacheManager.set(identifier, true, 1); // 1秒过期
        next();
    } catch (error) {
        console.error(`Duplicate request middleware error: ${error}`);
        next();
    }
};

export default duplicateRequestMiddleware;