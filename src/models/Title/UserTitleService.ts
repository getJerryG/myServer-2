import mongoose from "mongoose";
import { Title, UserTitle, IUserTitle } from "./TitleModel";
import TitleCacheService from "./TitleCacheService";

/**
 * 用户头衔选项接口
 */
export interface UserTitleOptions {
    titleId: mongoose.Types.ObjectId;
    status?: "active" | "equipped" | "expired" | "revoked";
    equipped?: boolean;
    metadata?: Record<string, unknown>;
}

/**
 * 用户头衔查询选项接口
 */
export interface UserTitleQueryOptions {
    status?: ("active" | "equipped" | "expired" | "revoked")[];
    isTimeLimited?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

/**
 * 用户头衔服务类
 * 处理用户头衔的授予、装备、撤销等操作
 */
export default class UserTitleService {
    /**
     * 检查头衔是否存在
     */
    private static async checkTitleExists(titleId: mongoose.Types.ObjectId) {
        const title = await Title.findById(titleId);
        if (!title) {
            throw new Error("Title not found");
        }
        return title;
    }

    /**
     * 检查用户是否已拥有该头衔
     */
    private static async getExistingUserTitle(userId: mongoose.Types.ObjectId, titleId: mongoose.Types.ObjectId) {
        return await UserTitle.findOne({
            userId,
            titleId
        });
    }

    /**
     * 恢复撤销或过期的头衔
     */
    private static async restoreUserTitle(
        existing: IUserTitle,
        options: UserTitleOptions,
        userId: mongoose.Types.ObjectId
    ) {
        existing.status = options.status || "active";
        existing.equipped = options.equipped || false;
        existing.metadata = options.metadata || {};
        existing.revokedAt = undefined;
        await existing.save();

        // 更新缓存
        await this.updateUserTitlesCache(userId);
        return existing;
    }

    /**
     * 创建新的用户头衔
     */
    private static async createNewUserTitle(
        userId: mongoose.Types.ObjectId,
        options: UserTitleOptions
    ) {
        // 创建新的用户头衔
        const userTitle = new UserTitle({
            userId,
            titleId: options.titleId,
            status: options.status || "active",
            equipped: options.equipped || false,
            metadata: options.metadata || {}
        });

        await userTitle.save();

        // 更新缓存
        await this.updateUserTitlesCache(userId);
        return userTitle;
    }

    /**
     * 授予头衔给用户
     * @param userId 用户ID
     * @param options 头衔选项
     * @returns 授予的用户头衔
     */
    static async grantTitleToUser(
        userId: mongoose.Types.ObjectId,
        options: UserTitleOptions
    ): Promise<IUserTitle> {
        // 检查头衔是否存在
        await this.checkTitleExists(options.titleId);

        // 检查用户是否已拥有该头衔
        const existing = await this.getExistingUserTitle(userId, options.titleId);

        if (existing) {
            // 如果头衔已存在且状态为撤销或过期，则恢复
            if (existing.status === "revoked" || existing.status === "expired") {
                return await this.restoreUserTitle(existing, options, userId);
            } else {
                throw new Error("User already has this title");
            }
        }

        // 创建新的用户头衔
        return await this.createNewUserTitle(userId, options);
    }

    /**
     * 装备头衔
     * @param userId 用户ID
     * @param userTitleId 用户头衔ID
     * @returns 装备的用户头衔
     */
    static async equipTitle(
        userId: mongoose.Types.ObjectId,
        userTitleId: mongoose.Types.ObjectId
    ): Promise<IUserTitle | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 取消所有已装备的头衔
            await UserTitle.updateMany(
                { userId, equipped: true },
                { equipped: false },
                { session }
            );

            // 装备指定头衔
            const userTitle = await UserTitle.findOneAndUpdate(
                { _id: userTitleId, userId, status: "active" },
                { equipped: true },
                { new: true, session }
            );

            if (!userTitle) {
                await session.abortTransaction();
                return null;
            }

            await session.commitTransaction();

            // 更新缓存
            await this.updateUserTitlesCache(userId);
            await this.updateUserEquippedTitleCache(userId, userTitle.titleId.toString());
            return userTitle;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    /**
     * 撤销头衔
     * @param userId 用户ID
     * @param userTitleId 用户头衔ID
     * @param reason 撤销原因
     * @returns 是否成功撤销
     */
    static async revokeTitle(
        userId: mongoose.Types.ObjectId,
        userTitleId: mongoose.Types.ObjectId,
        reason: string
    ): Promise<boolean> {
        const result = await UserTitle.findOneAndUpdate(
            { _id: userTitleId, userId },
            {
                status: "revoked",
                equipped: false,
                revokedAt: new Date(),
                $set: {
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            }
        );

        if (result) {
            // 更新缓存
            await this.updateUserTitlesCache(userId);
            
            // 如果撤销的是已装备的头衔，清除装备缓存
            if (result.equipped) {
                await TitleCacheService.deleteUserEquippedTitleCache(userId.toString());
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * 获取用户头衔列表
     * @param userId 用户ID
     * @param options 查询选项
     * @returns 用户头衔列表及分页信息
     */
    static async getUserTitles(
        userId: mongoose.Types.ObjectId,
        options: UserTitleQueryOptions = {}
    ): Promise<{ titles: IUserTitle[]; total: number; page: number; limit: number; totalPages: number }> {
        const query: Record<string, unknown> = { userId };
        
        // 添加状态筛选
        if (options.status && options.status.length > 0) {
            query.status = { $in: options.status };
        }

        // 分页参数
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // 排序参数
        const sort: Record<string, 1 | -1 | "asc" | "desc"> = {};
        if (options.sortBy) {
            sort[options.sortBy] = options.sortOrder || "asc";
        } else {
            sort.obtainedAt = "desc";
        }

        // 执行查询
        const [userTitles, total] = await Promise.all([
            UserTitle.find(query)
                .populate("titleId", "id title type description image status expiredAt category rarity isTimeLimited")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            UserTitle.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            titles: userTitles,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 获取用户当前装备的头衔
     * @param userId 用户ID
     * @returns 用户当前装备的头衔
     */
    static async getUserEquippedTitle(userId: mongoose.Types.ObjectId): Promise<IUserTitle | null> {
        // 尝试从缓存获取
        const cachedTitleId = await TitleCacheService.getUserEquippedTitleFromCache(userId.toString());
        if (cachedTitleId) {
            const userTitle = await UserTitle.findOne({
                userId,
                titleId: cachedTitleId,
                equipped: true
            }).populate("titleId");
            
            if (userTitle) {
                return userTitle;
            }
        }

        // 从数据库获取
        const userTitle = await UserTitle.findOne({
            userId,
            equipped: true
        }).populate("titleId");
        
        if (userTitle) {
            // 更新缓存
            await this.updateUserEquippedTitleCache(userId, userTitle.titleId.toString());
            return userTitle;
        }
        
        return null;
    }

    /**
     * 检查用户是否拥有特定头衔
     * @param userId 用户ID
     * @param titleId 头衔ID
     * @returns 是否拥有该头衔
     */
    static async checkUserHasTitle(
        userId: mongoose.Types.ObjectId,
        titleId: mongoose.Types.ObjectId
    ): Promise<boolean> {
        const userTitle = await UserTitle.findOne({
            userId,
            titleId,
            status: { $in: ["active", "equipped"] }
        });

        return !!userTitle;
    }

    /**
     * 批量授予头衔给用户
     * @param userId 用户ID
     * @param titleIds 头衔ID列表
     * @returns 成功授予的数量
     */
    static async batchGrantTitlesToUser(
        userId: mongoose.Types.ObjectId,
        titleIds: mongoose.Types.ObjectId[]
    ): Promise<number> {
        let grantedCount = 0;
        
        for (const titleId of titleIds) {
            try {
                await this.grantTitleToUser(userId, {
                    titleId
                });
                grantedCount++;
            } catch (error) {
                // 如果是用户已拥有该头衔的错误，忽略继续执行
                if ((error as Error).message !== "User already has this title") {
                    throw error;
                }
            }
        }
        
        // 更新缓存
        await this.updateUserTitlesCache(userId);
        return grantedCount;
    }

    /**
     * 批量撤销用户头衔
     * @param userId 用户ID
     * @param userTitleIds 用户头衔ID列表
     * @param reason 撤销原因
     * @returns 成功撤销的数量
     */
    static async batchRevokeTitlesFromUser(
        userId: mongoose.Types.ObjectId,
        userTitleIds: mongoose.Types.ObjectId[],
        reason: string
    ): Promise<number> {
        const result = await UserTitle.updateMany(
            { _id: { $in: userTitleIds }, userId },
            {
                status: "revoked",
                equipped: false,
                revokedAt: new Date(),
                $set: {
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            }
        );

        // 更新缓存
        await this.updateUserTitlesCache(userId);
        await TitleCacheService.deleteUserEquippedTitleCache(userId.toString());
        
        return result.modifiedCount;
    }

    /**
     * 更新用户头衔缓存
     * @param userId 用户ID
     */
    private static async updateUserTitlesCache(userId: mongoose.Types.ObjectId): Promise<void> {
        const userTitles = await UserTitle.find({ userId }).populate("titleId");
        // 更新缓存
        await TitleCacheService.cacheUserTitles(userId.toString(), userTitles);
    }

    /**
     * 更新用户装备头衔缓存
     * @param userId 用户ID
     * @param titleId 头衔ID
     */
    private static async updateUserEquippedTitleCache(
        userId: mongoose.Types.ObjectId,
        titleId: string
    ): Promise<void> {
        await TitleCacheService.cacheUserEquippedTitle(userId.toString(), titleId);
    }

    /**
     * 检查并更新过期头衔
     * @param userId 用户ID
     * @returns 过期的头衔数量
     */
    static async checkAndUpdateExpiredUserTitles(userId: mongoose.Types.ObjectId): Promise<number> {
        const now = new Date();
        
        // 获取所有活跃或已装备的头衔
        const userTitles = await UserTitle.find({
            userId,
            status: { $in: ["active", "equipped"] }
        }).populate("titleId");
        
        let updatedCount = 0;
        
        for (const userTitle of userTitles) {
            const title = userTitle.titleId as { expiredAt?: Date };
            if (title && title.expiredAt && title.expiredAt < now) {
                // 头衔已过期
                userTitle.status = "expired";
                userTitle.equipped = false;
                await userTitle.save();
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            // 更新缓存
            await this.updateUserTitlesCache(userId);
            await TitleCacheService.deleteUserEquippedTitleCache(userId.toString());
        }
        
        return updatedCount;
    }

    /**
     * 获取用户头衔统计信息
     * @param userId 用户ID
     * @returns 头衔统计信息
     */
    static async getUserTitleStatistics(userId: mongoose.Types.ObjectId): Promise<Record<string, unknown>> {
        const userTitles = await UserTitle.find({ userId }).populate("titleId");
        
        const stats = {
            total: userTitles.length,
            active: 0,
            equipped: 0,
            expired: 0,
            revoked: 0,
            byRarity: {
                common: 0,
                rare: 0,
                epic: 0,
                legendary: 0
            },
            byType: {} as Record<string, number>,
            timeLimited: 0,
            permanent: 0
        };
        
        for (const userTitle of userTitles) {
            // 按状态统计
            stats[userTitle.status]++;
            
            // 按稀有度和类型统计
            const title = userTitle.titleId as { rarity: string; type: string; isTimeLimited?: boolean };
            if (title) {
                stats.byRarity[title.rarity as keyof typeof stats.byRarity]++;
                stats.byType[title.type] = (stats.byType[title.type] || 0) + 1;
                
                // 按时限类型统计
                if (title.isTimeLimited) {
                    stats.timeLimited++;
                } else {
                    stats.permanent++;
                }
            }
        }
        
        return stats;
    }

    /**
     * 移除用户所有头衔
     * @param userId 用户ID
     * @param reason 移除原因
     * @returns 移除的头衔数量
     */
    static async removeAllUserTitles(
        userId: mongoose.Types.ObjectId,
        reason: string
    ): Promise<number> {
        const result = await UserTitle.updateMany(
            { userId },
            {
                status: "revoked",
                equipped: false,
                revokedAt: new Date(),
                $set: {
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            }
        );
        
        // 更新缓存
        await this.updateUserTitlesCache(userId);
        await TitleCacheService.deleteUserEquippedTitleCache(userId.toString());
        
        return result.modifiedCount;
    }
}