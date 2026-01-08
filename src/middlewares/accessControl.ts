import { Request, Response, NextFunction } from "express";

/**
 * 维护模式中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
const maintenance = (req: Request, res: Response, next: NextFunction) => {
    // 这里可以添加维护模式的逻辑
    // 例如：检查配置是否开启维护模式
    next();
};

export default maintenance;