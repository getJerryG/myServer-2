import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";

/**
 * 从请求头中提取token
 * @param authorization 请求头中的Authorization字段
 * @returns token字符串
 */
const extractTokenFromHeader = (authorization?: string): string | undefined => {
    if (!authorization) return undefined;
    const [type, token] = authorization.split(" ");
    return type === "Bearer" ? token : undefined;
};

interface RequestWithAuth extends Request {
    user?: any;
}

/**
 * 认证中间件
 * @description 验证用户token
 * @returns 认证中间件
 */
export const authMiddleware = (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            return res.status(401).json({ errCode: 4011001, message: "缺少token" });
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ errCode: 4011003, message: "token无效" });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ errCode: 4011002, message: "token过期" });
    }
};

export default authMiddleware;