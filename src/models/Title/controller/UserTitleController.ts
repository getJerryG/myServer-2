import mongoose from "mongoose";
import UserTitleService, { UserTitleOptions, UserTitleQueryOptions } from "../UserTitleService";
import { IUserTitle } from "../TitleModel";

export default class UserTitleController {
    private userTitleService: typeof UserTitleService;

    constructor() {
        this.userTitleService = UserTitleService;
    }

    /**
     * 授予头衔给用户
     * @param userId 用户ID
     * @param input 输入参数
     */
    async grantTitleToUser(userId: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
        if (!userId || !input.titleId) {
            throw new Error("userId and titleId are required");
        }

        const options: UserTitleOptions = {
            titleId: new mongoose.Types.ObjectId(input.titleId),
            status: input.status,
            equipped: input.equipped,
            metadata: input.metadata
        };

        const userTitle = await this.userTitleService.grantTitleToUser(
            new mongoose.Types.ObjectId(userId),
            options
        );

        // 返回格式化的响应
        return this.formatUserTitleResponse(userTitle);
    }

    /**
     * 装备头衔
     * @param userId 用户ID
     * @param userTitleId 用户头衔ID
     */
    async equipTitle(userId: string, userTitleId: string): Promise<Record<string, unknown> | null> {
        if (!userId || !userTitleId) {
            throw new Error("userId and userTitleId are required");
        }

        const userTitle = await this.userTitleService.equipTitle(
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(userTitleId)
        );

        // 返回格式化的响应
        return userTitle ? this.formatUserTitleResponse(userTitle) : null;
    }

    /**
     * 撤销头衔
     * @param userId 用户ID
     * @param userTitleId 用户头衔ID
     * @param reason 撤销原因
     */
    async revokeTitle(
        userId: string,
        userTitleId: string,
        reason: string
    ): Promise<{ success: boolean }> {
        if (!userId || !userTitleId || !reason) {
            throw new Error("userId, userTitleId and reason are required");
        }

        const result = await this.userTitleService.revokeTitle(
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(userTitleId),
            reason
        );

        // 返回结果
        return { success: result };
    }

    /**
     * 获取用户头衔列表
     * @param userId 用户ID
     * @param query 查询参数
     */
    async getUserTitles(
        userId: string,
        query: Record<string, unknown> = {}
    ): Promise<{
        titles: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        if (!userId) {
            throw new Error("userId is required");
        }

        const queryOptions: UserTitleQueryOptions = {
            status: query.status,
            isTimeLimited: query.isTimeLimited,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            page: query.page,
            limit: query.limit
        };

        const result = await this.userTitleService.getUserTitles(
            new mongoose.Types.ObjectId(userId),
            queryOptions
        );

        // 返回格式化的响应
        return {
            titles: result.titles.map((title) => this.formatUserTitleResponse(title)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    /**
     * 获取用户已装备的头衔
     * @param userId 用户ID
     */
    async getUserEquippedTitle(userId: string): Promise<Record<string, unknown> | null> {
        if (!userId) {
            throw new Error("userId is required");
        }

        const userTitle = await this.userTitleService.getUserEquippedTitle(
            new mongoose.Types.ObjectId(userId)
        );

        // 返回格式化的响应
        return userTitle ? this.formatUserTitleResponse(userTitle) : null;
    }

    /**
     * 检查用户是否拥有特定头衔
     * @param userId 用户ID
     * @param titleId 头衔ID
     */
    async checkUserHasTitle(
        userId: string,
        titleId: string
    ): Promise<{ hasTitle: boolean }> {
        if (!userId || !titleId) {
            throw new Error("userId and titleId are required");
        }

        const hasTitle = await this.userTitleService.checkUserHasTitle(
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(titleId)
        );

        // 返回结果
        return { hasTitle };
    }

    /**
     * 批量授予头衔给用户
     * @param userId 用户ID
     * @param titleIds 头衔ID列表
     */
    async batchGrantTitlesToUser(
        userId: string,
        titleIds: string[]
    ): Promise<{ grantedCount: number }> {
        if (!userId || !titleIds || titleIds.length === 0) {
            throw new Error("userId and titleIds are required");
        }

        const objectIds = titleIds.map((id) => new mongoose.Types.ObjectId(id));

        const grantedCount = await this.userTitleService.batchGrantTitlesToUser(
            new mongoose.Types.ObjectId(userId),
            objectIds
        );

        // 返回结果
        return { grantedCount };
    }

    /**
     * 获取用户头衔统计信息
     * @param userId 用户ID
     */
    async getUserTitleStatistics(userId: string): Promise<Record<string, unknown>> {
        if (!userId) {
            throw new Error("userId is required");
        }

        const stats = await this.userTitleService.getUserTitleStatistics(
            new mongoose.Types.ObjectId(userId)
        );

        // 返回结果
        return stats;
    }

    /**
     * 检查并更新过期的用户头衔
     * @param userId 用户ID
     */
    async checkAndUpdateExpiredUserTitles(
        userId: string
    ): Promise<{ updatedCount: number }> {
        if (!userId) {
            throw new Error("userId is required");
        }

        const updatedCount = await this.userTitleService.checkAndUpdateExpiredUserTitles(
            new mongoose.Types.ObjectId(userId)
        );

        // 返回结果
        return { updatedCount };
    }

    /**
     * 移除用户所有头衔
     * @param userId 用户ID
     * @param reason 移除原因
     */
    async removeAllUserTitles(
        userId: string,
        reason: string
    ): Promise<{ removedCount: number }> {
        if (!userId || !reason) {
            throw new Error("userId and reason are required");
        }

        const removedCount = await this.userTitleService.removeAllUserTitles(
            new mongoose.Types.ObjectId(userId),
            reason
        );

        // 返回结果
        return { removedCount };
    }

    /**
     * 格式化用户头衔响应
     * @param userTitle 用户头衔对象
     */
    private formatUserTitleResponse(userTitle: IUserTitle): Record<string, unknown> {
        const response: Record<string, unknown> = {
            _id: userTitle._id,
            userId: userTitle.userId,
            titleId: userTitle.titleId,
            obtainedAt: userTitle.obtainedAt.toISOString(),
            status: userTitle.status,
            equipped: userTitle.equipped,
            revokedAt: userTitle.revokedAt?.toISOString(),
            metadata: userTitle.metadata
        };

        // 如果titleId是populated的，添加titleInfo
        if (userTitle.titleId && typeof userTitle.titleId !== "string" && "id" in userTitle.titleId) {
            const titleObj = userTitle.titleId as {
                id: string;
                title: string;
                description: string;
                type: string;
                image?: string;
                rarity: string;
                category: string;
            };
            response.titleInfo = {
                id: titleObj.id,
                title: titleObj.title,
                description: titleObj.description,
                type: titleObj.type,
                image: titleObj.image,
                rarity: titleObj.rarity,
                category: titleObj.category
            };
        }

        return response;
    }
}

// 创建控制器实例
export const userTitleController = new UserTitleController();
