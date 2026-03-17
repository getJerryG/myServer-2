import express, { Request, Response, Router } from "express";
import UserService from "../models/User/services/userService";
import { createAdminToken } from "@/utils/jwt";
import { resSuccess, resBadRequest, resInternalServerError } from "../utils/res";

const router: Router = express.Router();

/**
 * 检查是否为超级管理员
 * @param username 用户名
 * @param password 密码
 * @returns 是否为超级管理员
 */
const isSuperAdmin = (username: string, password: string): boolean => {
    return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
};

/**
 * 管理员登录
 * @method POST
 * @route /admin/login
 * @returns JWT token
 */
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { userId, username, password } = req.body;
        console.log(userId, username, password);
        
        if (isSuperAdmin(username, password)) {
            const token = createAdminToken({ userId, permission: 2 });
            resSuccess(res, {
                token,
                permission: "super_admin"
            }, "登录成功");
            return;
        }
        
        const user = await UserService.getUser(userId);
        if (!user) {
            return resBadRequest(res, "用户不存在");
        }
        
        const token = createAdminToken({ userId, permission: 1 });
        resSuccess(res, {
            token,
            permission: "admin"
        }, "登录成功");
    } catch (error) {
        console.error("管理员登录失败:", error);
        resInternalServerError(res, "服务器错误");
    }
});

export default router;