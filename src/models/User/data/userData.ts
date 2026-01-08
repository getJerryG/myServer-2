import UserController from "../config/UserController";
import UserModel from "../models/users";
import type { IUser, UserType } from "../types/user";

/**
 * 用户数据处理类
 * 用于处理用户数据的创建、更新、状态管理等操作
 */
export default class User {
    userData: UserType;
    userModel = UserModel;
    data: IUser | null = null;

    constructor() { }

    static async getSession_key(userId: number) {
        return await UserModel.findOne({ userId },{session_key:1,_id:1,userId:1});
    }

    /**
     * 创建用户
     * @param userData 用户数据
     * @returns 创建的用户
     */
    static async create(userData: UserType): Promise<IUser> {
        try {
            const userController = new UserController(userData);
            return await new UserModel(userController).save();
        } catch (error) {
            throw new Error("创建用户失败");
        }
    }

    /**
     * 更新用户数据
     * @param updateObj 更新对象
     * @returns 更新后的用户数据
     */
    async update(updateObj: Partial<IUser>): Promise<IUser | null> {
        try {
            const update = {
                $set: {
                    ...updateObj,
                    updatedAt: Date.now()
                }
            };

            if (!this.data?.userId) {
                throw new Error("用户数据不存在");
            }

            return await UserModel.findOneAndUpdate(
                { userId: this.data.userId },
                update,
                { new: true, lean: true }
            );
        } catch (error) {
            console.error("更新用户数据失败:", error);
            throw error;
        }
    }

    /**
     * 更新用户状态
     * @param status 用户状态
     */
    async status(status: 0 | 1 | 2 | 3): Promise<void> {
        try {
            await this.update({ status });
        } catch (error) {
            console.error("更新用户状态失败:", error);
            throw error;
        }
    }

    /**
     * 更新用户角色
     * @param role 用户角色
     */
    async role(role: 0 | 1 | 2): Promise<void> {
        try {
            await this.update({ role });
        } catch (error) {
            console.error("更新用户角色失败:", error);
            throw error;
        }
    }

    /**
     * 批量更新指定等级以下用户的奖励
     * @param level 等级
     * @param reward 奖励内容
     */
    static async rewardLvAll(level: number, reward: any): Promise<void> {
        try {
            await UserModel.updateMany(
                { level: { $lt: level } },
                { $set: reward }
            );
        } catch (error) {
            console.error("批量更新用户奖励失败:", error);
            throw error;
        }
    }

    /**
     * 增加用户经验
     * @param exp 经验值
     */
    async addExp(exp: number): Promise<void> {
        try {
            if (!this.data?.userId) {
                return Promise.reject("用户ID不存在");
            }

            await this.update({ status: 1 });
            await UserModel.updateOne(
                { userId: this.data.userId },
                { $inc: { exp } }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * 用户签到
     * @returns 签到结果
     */
    async signIn(): Promise<IUser | null> {
        try {
            if (!this.data?.signIn) {
                throw new Error("用户数据不存在");
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastSignInTime = new Date(this.data.signIn.lastSignInTime);
            lastSignInTime.setHours(0, 0, 0, 0);

            // 检查是否已经签到
            if (today.getTime() === lastSignInTime.getTime()) {
                return Promise.reject("今日已签到");
            }

            // 检查是否连续签到
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            let continuousCheckIn = false;
            if (lastSignInTime.getTime() === yesterday.getTime()) {
                continuousCheckIn = true;
            }

            // 更新签到信息
            const update = {
                $inc: {
                    exp: 200,
                    "pay.integral": 50
                },
                $set: {
                    "signIn.lastSignInTime": new Date(),
                    "signIn.signInDays": continuousCheckIn ? (this.data.signIn.signInDays + 1) : 1
                }
            };

            if (!this.data?.userId) {
                throw new Error("用户ID不存在");
            }

            return await UserModel.findOneAndUpdate(
                { userId: this.data.userId },
                update,
                { new: true, lean: true }
            );
        } catch (error) {
            console.error("用户签到失败:", error);
            throw error;
        }
    }

    /**
     * 用户登录
     * @returns 登录结果
     */
    async login(): Promise<string> {
        try {
            if (!this.data?.userId) {
                throw new Error("用户ID不存在");
            }

            const update = {
                $inc: {
                    loginCount: 1
                },
                $set: {
                    lastLoginTime: new Date()
                }
            };

            await UserModel.updateOne({ userId: this.data.userId }, update);
            return "登录成功";
        } catch (error) {
            console.error("用户登录失败:", error);
            throw error;
        }
    }

    /**
     * 禁止用户
     */
    async ban(): Promise<void> {
        await this.status(0);
    }

    /**
     * 解除禁止用户
     */
    async unban(): Promise<void> {
        await this.status(1);
    }

    /**
     * 永久禁止用户
     */
    async foreverBan(): Promise<void> {
        await this.status(3);
    }

    /**
     * 用户登出
     */
    async logout(): Promise<void> {
        await this.status(2);
    }

    /**
     * 佩戴头衔（未实现）
     */
    async wearTitle(): Promise<void> {
        throw new Error("Method not implemented");
    }

    /**
     * 卸下头衔（未实现）
     */
    async umWearTitle(): Promise<void> {
        throw new Error("Method not implemented");
    }

    /**
     * 获取所有用户
     * @returns 用户列表
     */
    static async getAll(): Promise<IUser[]> {
        try {
            return await UserModel.find(
                {},
                {
                    password: 0,
                    session_key: 0,
                    openId: 0,
                    permission: 0,
                    game: 0
                }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * 查询用户
     * @param query 查询条件
     * @returns 用户列表
     */
    static async find(query: any = {}, projection: any = {}): Promise<IUser[]> {
        try {
            return await UserModel.find(query, projection).exec();
        } catch (_error) {
            throw new Error("查询用户失败");
        }
    }

    /**
     * 查询单个用户
     * @param query 查询条件
     * @returns 用户信息
     */
    static async findOne(query: any = {}, projection: any = {}): Promise<IUser | null> {
        try {
            return await UserModel.findOne(query, projection).exec();
        } catch (_error) {
            throw new Error("查询单个用户失败");
        }
    }

    /**
     * 查询并更新用户
     * @param query 查询条件
     * @param update 更新内容
     * @param options 更新选项
     * @returns 更新后的用户信息
     */
    static async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<IUser | null> {
        try {
            return await UserModel.findOneAndUpdate(query, update, options).exec();
        } catch (error) {
            console.error("查询并更新用户失败:", error);
            throw error;
        }
    }

    /**
     * 删除用户
     * @param query 查询条件
     * @returns 删除结果
     */
    static async deleteOne(query: any): Promise<{ deletedCount: number }> {
        try {
            return await UserModel.deleteOne(query).exec();
        } catch (error) {
            console.error("删除用户失败:", error);
            throw error;
        }
    }

    /**
     * 清理用户数据
     */
    [Symbol.dispose](): void {
        this.data = null;
    }
}