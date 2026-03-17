import TitleService, { TitleCreateOptions, TitleUpdateOptions, TitleQueryOptions } from "../TitleService";
import { ITitle } from "../TitleModel";

export interface TitleDisplayItem {
    id: string;
    title: string;
    description: string;
    type: string;
    image?: string;
    status: string;
    rarity: string;
    category: string;
    createdAt: string;
    expiredAt?: string;
    remainingTime?: number;
    isExpired: boolean;
    conditions: Record<string, unknown>;
    displayInfo?: Record<string, unknown>;
}

export default class TitleController {
    private titleService: typeof TitleService;

    constructor() {
        this.titleService = TitleService;
    }

    /**
     * 创建头衔
     * @param input 输入参数
     */
    async createTitle(input: Record<string, unknown>): Promise<TitleDisplayItem> {
        if (!input.title || !input.type || !input.description) {
            throw new Error("title, type, and description are required");
        }

        const createOptions: TitleCreateOptions = {
            title: input.title,
            type: input.type,
            description: input.description,
            image: input.image,
            status: input.status,
            expiredAt: input.expiredAt ? new Date(input.expiredAt) : undefined,
            conditions: input.conditions || {},
            category: input.category,
            rarity: input.rarity,
            isTimeLimited: input.isTimeLimited
        };

        const title = await this.titleService.createTitle(createOptions);

        // 返回格式化的响应
        return this.formatTitleResponse(title);
    }

    /**
     * 根据ID获取头衔
     * @param id 头衔ID
     */
    async getTitleById(id: string): Promise<TitleDisplayItem | null> {
        if (!id) {
            throw new Error("id is required");
        }

        const title = await this.titleService.getTitleById(id);

        // 返回格式化的响应
        return title ? this.formatTitleResponse(title) : null;
    }

    /**
     * 更新头衔
     * @param id 头衔ID
     * @param input 输入参数
     */
    async updateTitle(id: string, input: Record<string, unknown>): Promise<TitleDisplayItem | null> {
        if (!id) {
            throw new Error("id is required");
        }

        const updateOptions: TitleUpdateOptions = {
            title: input.title,
            type: input.type,
            description: input.description,
            image: input.image,
            status: input.status,
            expiredAt: input.expiredAt ? new Date(input.expiredAt) : undefined,
            conditions: input.conditions,
            category: input.category,
            rarity: input.rarity,
            isTimeLimited: input.isTimeLimited
        };

        const title = await this.titleService.updateTitle(id, updateOptions);

        // 返回格式化的响应
        return title ? this.formatTitleResponse(title) : null;
    }

    /**
     * 检查头衔是否存在
     * @param title 头衔名称
     * @param excludeId 排除的ID
     */
    async checkTitleExists(title: string, excludeId?: string): Promise<{ exists: boolean }> {
        if (!title) {
            throw new Error("title is required");
        }

        const exists = await this.titleService.checkTitleExists(title, excludeId);

        // 返回结果
        return { exists };
    }

    /**
     * 根据头衔名称获取头衔
     * @param title 头衔名称
     */
    async getTitleByTitle(title: string): Promise<TitleDisplayItem | null> {
        if (!title) {
            throw new Error("title is required");
        }

        const titleRecord = await this.titleService.getTitleByTitle(title);

        // 返回格式化的响应
        return titleRecord ? this.formatTitleResponse(titleRecord) : null;
    }

    /**
     * 删除头衔
     * @param id 头衔ID
     */
    async deleteTitle(id: string): Promise<{ success: boolean }> {
        if (!id) {
            throw new Error("id is required");
        }

        const result = await this.titleService.deleteTitle(id);

        // 返回结果
        return { success: result };
    }

    /**
     * 查询头衔列表
     * @param query 查询参数
     */
    async queryTitles(query: Record<string, unknown>): Promise<{
        titles: TitleDisplayItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const queryOptions: TitleQueryOptions = {
            status: query.status,
            type: query.type,
            category: query.category,
            rarity: query.rarity,
            searchKeyword: query.searchKeyword,
            isTimeLimited: query.isTimeLimited,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            page: query.page,
            limit: query.limit
        };

        const result = await this.titleService.queryTitles(queryOptions);

        // 返回格式化的响应
        return {
            titles: result.titles.map((title) => this.formatTitleResponse(title)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    /**
     * 获取热门头衔
     * @param limit 数量限制
     */
    async getPopularTitles(limit = 20): Promise<TitleDisplayItem[]> {
        if (limit < 1 || limit > 100) {
            throw new Error("limit must be between 1 and 100");
        }

        const titles = await this.titleService.getPopularTitles(limit);

        // 返回格式化的响应
        return titles.map((title) => this.formatTitleResponse(title));
    }

    /**
     * 获取即将过期的头衔
     * @param days 天数
     * @param limit 数量限制
     */
    async getExpiringTitles(days = 7, limit = 20): Promise<TitleDisplayItem[]> {
        if (days < 1 || days > 365) {
            throw new Error("days must be between 1 and 365");
        }
        if (limit < 1 || limit > 100) {
            throw new Error("limit must be between 1 and 100");
        }

        const titles = await this.titleService.getExpiringTitles(days, limit);

        // 返回格式化的响应
        return titles.map((title) => this.formatTitleResponse(title));
    }

    /**
     * 格式化头衔响应
     * @param title 头衔对象
     */
    private formatTitleResponse(title: ITitle): TitleDisplayItem {
        return {
            id: title.id,
            title: title.title,
            description: title.description,
            type: title.type,
            image: title.image,
            status: title.status,
            rarity: title.rarity,
            category: title.category,
            createdAt: title.createdAt.toISOString(),
            expiredAt: title.expiredAt?.toISOString(),
            remainingTime: title.expiredAt
                ? Math.max(0, Math.floor((title.expiredAt.getTime() - Date.now()) / 1000))
                : undefined,
            isExpired: title.status === "expired",
            conditions: title.conditions,
            displayInfo: {
                rarityLabel: this.getRarityLabel(title.rarity),
                statusLabel: this.getStatusLabel(title.status),
                typeLabel: title.type
            }
        };
    }

    /**
     * 获取稀有度标签
     * @param rarity 稀有度
     */
    private getRarityLabel(rarity: string): string {
        const labels: Record<string, string> = {
            common: "普通",
            rare: "稀有",
            epic: "史诗",
            legendary: "传说"
        };
        return labels[rarity] || rarity;
    }

    /**
     * 获取状态标签
     * @param status 状态
     */
    private getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            active: "激活",
            inactive: "未激活",
            expired: "已过期",
            pending: "待激活"
        };
        return labels[status] || status;
    }
}

// 创建控制器实例
export const titleController = new TitleController();
