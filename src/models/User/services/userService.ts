import User from "../data/userData";
import { IUser, UserType } from "types/User";
import RedisCacheManager from "@/utils/redisCache";
/**
 * 用户服务类
 */
export default class UserService {
    /**
     * 创建用户
     * @param userInfo 用户信息
     * @returns 创建的用户
     */
    static async createUser(userInfo: UserType) {
        try {
            const user = await User.create(userInfo);
            return user;
        } catch (error) {
            console.error("创建用户失败:", error);
            throw error;
        }
    }

    static getInfo(user: IUser) {
        return {
            userId: user.userId,
            username: user?.username || "",
            nickname: user.nickname,
            avatar: user.avatar,
            role: user.role,
            sex: user.sex,
            permission: user.permission,
            exp: user.exp,
            status: user.status,
            lastLoginTime: user?.lastLoginTime || null,
            signIn: {
                signInDays: user.signIn?.signInDays || 0,
                lastSignInTime: user.signIn?.lastSignInTime || null,
            }
        };

    }
    /**
     * 获取用户_id,用于查询数据库、绑定数据库
     * @param userId 用户UserId
     * @returns 用户_id 
     */
    static async get_Id(userId: number) {
        const user = await User.findOne({ userId }, { _id: 1 });
        return user?._id;
    }
    static async getUserId(openId: string) {
        const user = await User.findOne({ openId }, { userId: 1 });
        return user?.userId;
    }
    /**
     * 获取用户信息
     * @param userId 用户ID
     * @returns 用户信息
     */
    static async getUser(userId: number) {
        // 先从缓存中获取用户信息，设置超时处理
        const cacheKey = `user:info:${userId}`;
        let user;
        
        try {
            // 设置Redis操作超时时间为500ms
            const cachePromise = RedisCacheManager.get(cacheKey);
            const timeoutPromise = new Promise<undefined>((_, reject) => {
                setTimeout(() => reject(new Error("Redis操作超时")), 500);
            });
            
            user = await Promise.race([cachePromise, timeoutPromise]);
        } catch (_error) {
            return new Error("Redis操作超时,现在从数据库查询");
        }
        
        if (user) {
            return user;
        }
        
        // 从数据库查询
        const dbUser = await User.findOne({ userId });
        if (!dbUser) {
            return null;
        }

        const userVal = UserService.getInfo(dbUser);
        
        // 异步更新缓存，不阻塞返回
        RedisCacheManager.set(cacheKey, userVal, 1800).catch(error => {
            console.warn("Redis缓存更新失败:", error);
        });
        
        return userVal;
    }
    /**
     * 获得用户登录权
     * @param userId 用户ID
     * @returns 用户登录权
     */
    static async getSession_key(userId: number) {
        return await User.getSession_key(userId);
    }
    /**
     * 获取所有用户
     * @returns 用户列表
     */
    static async getAllUser() {
        try {
            const users = await User.find();
            return users;
        } catch (error) {
            console.error("获取所有用户失败:", error);
            throw error;
        }
    }

    /**
     * 更新用户信息
     * @param userId 用户ID
     * @param updateInfo 更新信息
     * @returns 更新后的用户
     */
    static async updateUser(userId: number, updateInfo: Partial<UserType>) {
        try {
            const user = await User.findOneAndUpdate({ userId }, updateInfo, { new: true });
            return user;
        } catch (error) {
            console.error(`更新用户 ${userId} 信息失败:`, error);
            throw error;
        }
    }

    /**
     * 删除用户
     * @param userId 用户ID
     * @returns 删除结果
     */
    static async deleteUser(userId: number) {
        try {
            const result = await User.deleteOne({ userId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`删除用户 ${userId} 失败:`, error);
            throw error;
        }
    }
}