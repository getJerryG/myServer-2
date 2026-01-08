import UserService from "./services/userService";
import OpenIdLogin from "./services/openId";
import { createToken } from "@/utils/jwt";
/**
 * 用户模型入口
 */
export default class User {
    /**
     * 用户注册
     * @param openId 微信openId
     * @param session_key 微信会话密钥
     * @returns 注册结果
     */
    static async register(openId: string, session_key: string) {
        const user = await UserService.createUser({ openId, session_key });
        // 触发用户注册事件
        // event.emit("API: USER:REGISTER", user.userId);
        return {
            userId: user.userId,
            username: user.username,
            openId: user.openId
        };
    }

    /**
     * 用户登录
     * @param openId 微信openId
     * @param session_key 微信会话密钥
     * @returns 登录结果
     */
    static async login(userId: number, session_key: string) {

        const user = await UserService.getSession_key(userId);

        if (!user) {
            throw new Error("用户不存在");
        }

        console.log("用户登录成功:", user);

        // 登录成功，返回登录结果
        return {
            userId: userId,
            token: createToken({
                userId: userId,
                _id: user._id
            },"7Day")
        };
    }

    /**
     * 获取用户信息
     * @param userId 用户ID
     * @returns 用户信息
     */
    static async getUserInfo(userId: number) {
        return await UserService.getUser(userId);
    }

    /**
     * 更新用户信息
     * @param userId 用户ID
     * @param updateInfo 更新信息
     * @returns 更新结果
     */
    static async updateUserInfo(userId: number, updateInfo: any) {
        return await UserService.updateUser(userId, updateInfo);
    }
}

// 导出服务
export { UserService };
export { OpenIdLogin };