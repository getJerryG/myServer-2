import { Request, Response, NextFunction } from "express";

// 扩展 Express Request 接口，添加 permission 属性
interface RequestWithPermission extends Request {
    permission?: number;
}

/**
 * 权限验证中间件生成函数
 * @param requiredPermission 需要的权限级别
 * @returns 中间件函数
 *
 * 权限级别说明：
 * - 0: 普通用户
 * - 1: 管理员
 * - 2: 超级管理员
 */
const permission = (requiredPermission: number) => {
    return (req: RequestWithPermission, res: Response, next: NextFunction) => {
        const userPermission = req.permission || 0;
        
        if (userPermission < requiredPermission) {
            return res.status(403).json({
                errCode: 403001,
                message: "权限不足"
            });
        }
        
        next();
    };
};

// 导出不同权限级别的中间件
export const User = permission(0);
export const Admin = permission(1);
export const SuperAdmin = permission(2);