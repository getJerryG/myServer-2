import mongoose from "mongoose";
import ClanTitleService, { ClanTitleOptions, ClanTitleQueryOptions } from "../ClanTitleService";
import { IClanTitle } from "../TitleModel";

export default class ClanTitleController {
    private clanTitleService: typeof ClanTitleService;

    constructor() {
        this.clanTitleService = ClanTitleService;
    }

    /**
     * 授予头衔给战队
     * @param clanId 战队ID
     * @param input 输入参数
     */
    async grantTitleToClan(
        clanId: string,
        input: { 
            titleId: string; 
            status?: string; 
            equipped?: boolean; 
            metadata?: Record<string, unknown> 
        }
    ): Promise<Record<string, unknown>> {
        if (!clanId || !input.titleId) {
            throw new Error("clanId and titleId are required");
        }

        const options: ClanTitleOptions = {
            titleId: new mongoose.Types.ObjectId(input.titleId),
            status: input.status,
            equipped: input.equipped,
            metadata: input.metadata
        };

        const clanTitle = await this.clanTitleService.grantTitleToClan(
            new mongoose.Types.ObjectId(clanId),
            options
        );

        // 返回格式化的响应
        return this.formatClanTitleResponse(clanTitle);
    }

    /**
     * 装备头衔
     * @param clanId 战队ID
     * @param clanTitleId 战队头衔ID
     */
    async equipTitle(clanId: string, clanTitleId: string): Promise<Record<string, unknown> | null> {
        if (!clanId || !clanTitleId) {
            throw new Error("clanId and clanTitleId are required");
        }

        const clanTitle = await this.clanTitleService.equipTitle(
            new mongoose.Types.ObjectId(clanId),
            new mongoose.Types.ObjectId(clanTitleId)
        );

        // 返回格式化的响应
        return clanTitle ? this.formatClanTitleResponse(clanTitle) : null;
    }

    /**
     * 撤销头衔
     * @param clanId 战队ID
     * @param clanTitleId 战队头衔ID
     * @param reason 撤销原因
     */
    async revokeTitle(
        clanId: string,
        clanTitleId: string,
        reason: string
    ): Promise<{ success: boolean }> {
        if (!clanId || !clanTitleId || !reason) {
            throw new Error("clanId, clanTitleId and reason are required");
        }

        const result = await this.clanTitleService.revokeTitle(
            new mongoose.Types.ObjectId(clanId),
            new mongoose.Types.ObjectId(clanTitleId),
            reason
        );

        // 返回结果
        return { success: result };
    }

    /**
     * 获取战队头衔列表
     * @param clanId 战队ID
     * @param query 查询参数
     */
    async getClanTitles(
        clanId: string,
        query: Record<string, unknown> = {}
    ): Promise<{
        titles: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        if (!clanId) {
            throw new Error("clanId is required");
        }

        const queryOptions: ClanTitleQueryOptions = {
            status: query.status,
            isTimeLimited: query.isTimeLimited,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            page: query.page,
            limit: query.limit
        };

        const result = await this.clanTitleService.getClanTitles(
            new mongoose.Types.ObjectId(clanId),
            queryOptions
        );

        // 返回格式化的响应
        return {
            titles: result.titles.map((title) => this.formatClanTitleResponse(title)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    /**
     * 获取战队已装备的头衔
     * @param clanId 战队ID
     */
    async getClanEquippedTitle(clanId: string): Promise<Record<string, unknown> | null> {
        if (!clanId) {
            throw new Error("clanId is required");
        }

        const clanTitle = await this.clanTitleService.getClanEquippedTitle(
            new mongoose.Types.ObjectId(clanId)
        );

        // 返回格式化的响应
        return clanTitle ? this.formatClanTitleResponse(clanTitle) : null;
    }

    /**
     * 检查战队是否拥有特定头衔
     * @param clanId 战队ID
     * @param titleId 头衔ID
     */
    async checkClanHasTitle(
        clanId: string,
        titleId: string
    ): Promise<{ hasTitle: boolean }> {
        if (!clanId || !titleId) {
            throw new Error("clanId and titleId are required");
        }

        const hasTitle = await this.clanTitleService.checkClanHasTitle(
            new mongoose.Types.ObjectId(clanId),
            new mongoose.Types.ObjectId(titleId)
        );

        // 返回结果
        return { hasTitle };
    }

    /**
     * 批量授予头衔给战队
     * @param clanId 战队ID
     * @param titleIds 头衔ID列表
     */
    async batchGrantTitlesToClan(
        clanId: string,
        titleIds: string[]
    ): Promise<{ grantedCount: number }> {
        if (!clanId || !titleIds || titleIds.length === 0) {
            throw new Error("clanId and titleIds are required");
        }

        const objectIds = titleIds.map((id) => new mongoose.Types.ObjectId(id));

        const grantedCount = await this.clanTitleService.batchGrantTitlesToClan(
            new mongoose.Types.ObjectId(clanId),
            objectIds
        );

        // 返回结果
        return { grantedCount };
    }

    /**
     * 获取战队头衔统计信息
     * @param clanId 战队ID
     */
    async getClanTitleStatistics(clanId: string): Promise<Record<string, unknown>> {
        if (!clanId) {
            throw new Error("clanId is required");
        }

        const stats = await this.clanTitleService.getClanTitleStatistics(
            new mongoose.Types.ObjectId(clanId)
        );

        // 返回结果
        return stats;
    }

    /**
     * 检查并更新过期的战队头衔
     * @param clanId 战队ID
     */
    async checkAndUpdateExpiredClanTitles(
        clanId: string
    ): Promise<{ updatedCount: number }> {
        if (!clanId) {
            throw new Error("clanId is required");
        }

        const updatedCount = await this.clanTitleService.checkAndUpdateExpiredClanTitles(
            new mongoose.Types.ObjectId(clanId)
        );

        // 返回结果
        return { updatedCount };
    }

    /**
     * 移除战队所有头衔
     * @param clanId 战队ID
     * @param reason 移除原因
     */
    async removeAllClanTitles(
        clanId: string,
        reason: string
    ): Promise<{ removedCount: number }> {
        if (!clanId || !reason) {
            throw new Error("clanId and reason are required");
        }

        const removedCount = await this.clanTitleService.removeAllClanTitles(
            new mongoose.Types.ObjectId(clanId),
            reason
        );

        // 返回结果
        return { removedCount };
    }

    /**
     * 格式化战队头衔响应
     * @param clanTitle 战队头衔对象
     */
    private formatClanTitleResponse(clanTitle: IClanTitle): Record<string, unknown> {
        const response: Record<string, unknown> = {
            _id: clanTitle._id,
            clanId: clanTitle.clanId,
            titleId: clanTitle.titleId,
            obtainedAt: clanTitle.obtainedAt.toISOString(),
            status: clanTitle.status,
            equipped: clanTitle.equipped,
            revokedAt: clanTitle.revokedAt?.toISOString(),
            metadata: clanTitle.metadata
        };

        // 如果titleId是populated的，添加titleInfo
        if (clanTitle.titleId && typeof clanTitle.titleId !== "string" && "id" in clanTitle.titleId) {
            const titleObj = clanTitle.titleId as {
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
export const clanTitleController = new ClanTitleController();
