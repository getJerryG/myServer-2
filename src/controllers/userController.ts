import { Request, Response } from "express";
import UserService from "@/models/User/services/userService";
import { resSuccess, resBadRequest, resUnauthorized, resNotFound, resInternalServerError } from "@/utils/res";

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
export default class UserController {
    /**
     * 获取当前用户信息
     * @param req 请求对象
     * @param res 响应对象
     */
    static async getUser(req: Request, res: Response) {
        try {
            console.log("getUser controller called");
            console.log("req.user:", req.user);
            const userId = req.user?.userId;
            console.log("userId:", userId);
            if (!userId) {
                return resUnauthorized(res, "未授权");
            }
            
            const userInfo = await UserService.getUser(userId);
            console.log("userInfo:", userInfo);
            if (!userInfo) {
                return resNotFound(res, "用户不存在");
            }
            
            return resSuccess(res, userInfo, "获取用户信息成功");
        } catch (error) {
            console.error("获取用户信息失败:", error);
            return resInternalServerError(res, "服务器错误");
        }
    }

    /**
     * 更新用户信息
     * @param req 请求对象
     * @param res 响应对象
     */
    static async upDataUser(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return resUnauthorized(res, "未授权");
            }
            
            const updateInfo = req.body;
            const updatedUser = await UserService.updateUser(userId, updateInfo);
            
            return resSuccess(res, updatedUser, "更新用户信息成功");
        } catch (_error) {
            return resInternalServerError(res, "服务器错误");
        }
    }

    /**
     * 删除用户
     * @param req 请求对象
     * @param res 响应对象
     */
    static async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return resUnauthorized(res, "未授权");
            }
            
            const result = await UserService.deleteUser(userId);
            if (!result) {
                return resNotFound(res, "用户不存在");
            }
            
            return resSuccess(res, null, "删除成功");
        } catch (_error) {
            return resInternalServerError(res, "服务器错误");   
        }
    }

    /**
     * 用户签到
     * @param req 请求对象
     * @param res 响应对象
     */
    static async signIn(_req: Request, res: Response) {
        try {
            // 这里可以添加签到逻辑
            return resSuccess(res, null, "签到成功");
        } catch (_error) {
            return resInternalServerError(res, "服务器错误");
        }
    }

    /**
     * 获取其他用户信息
     * @param req 请求对象
     * @param res 响应对象
     */
    static async getOtherUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            if (!userId || isNaN(Number(userId))) {
                return resBadRequest(res, "无效的用户ID");
            }
            
            const userInfo = await UserService.getUser(Number(userId));
            if (!userInfo) {
                return resNotFound(res, "用户不存在");
            }
            
            return resSuccess(res, UserService.getInfo(userInfo), "获取用户信息成功");
        } catch (_error) {
            return resInternalServerError(res, "服务器错误");
        }
    }

    /**
     * 获取所有用户列表
     * @param req 请求对象
     * @param res 响应对象
     */
    static async getAllUser(_req: Request, res: Response) {
        try {
            const users = await UserService.getAllUser();
            return resSuccess(res, users.map(UserService.getInfo), "获取所有用户成功");
        } catch (_error) {
            return resInternalServerError(res, "服务器错误");
        }
    }
}