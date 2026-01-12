import TitleBase, { TitleStatus, TitleType } from "./index";
import { titleLibrary } from "./index";

export type TitleSortOption = 
    | "createdAt_asc"
    | "createdAt_desc"
    | "expiredAt_asc"
    | "expiredAt_desc"
    | "rarity_asc"
    | "rarity_desc"
    | "title_asc"
    | "title_desc"
    | "type_asc"
    | "type_desc";

export interface TitleFilter {
    status?: string[];
    type?: TitleType[];
    category?: string[];
    rarity?: ("common" | "rare" | "epic" | "legendary")[];
    searchKeyword?: string;
    timeLimit?: boolean;
}

export interface TitleDisplayConfig {
    showImage?: boolean;
    showDescription?: boolean;
    showRarity?: boolean;
    showExpiration?: boolean;
    showConditions?: boolean;
    sortBy?: TitleSortOption;
    filter?: TitleFilter;
    limit?: number;
}

export interface TitleDisplayItem {
    id: string;
    title: string;
    description: string;
    type: TitleType;
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

export default class TitleDisplayService {
    private rarityOrder: Record<string, number> = {
        common: 0,
        rare: 1,
        epic: 2,
        legendary: 3
    };

    constructor() {
        console.log("TitleDisplayService initialized");
    }

    /**
     * 将TitleBase转换为显示项
     * @param title TitleBase对象
     */
    private convertToDisplayItem(title: TitleBase): TitleDisplayItem {
        const remainingTime = title.getRemainingTime();
        
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
            remainingTime: remainingTime,
            isExpired: title.status === TitleStatus.EXPIRED,
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

    /**
     * 对头衔进行排序
     * @param titles 头衔列表
     * @param sortBy 排序方式
     */
    private sortTitles(titles: TitleBase[], sortBy: TitleSortOption): TitleBase[] {
        return [...titles].sort((a, b) => {
            switch (sortBy) {
            case "createdAt_asc":
                return a.createdAt.getTime() - b.createdAt.getTime();
            case "createdAt_desc":
                return b.createdAt.getTime() - a.createdAt.getTime();
            case "expiredAt_asc":
                if (!a.expiredAt) return -1;
                if (!b.expiredAt) return 1;
                return a.expiredAt.getTime() - b.expiredAt.getTime();
            case "expiredAt_desc":
                if (!a.expiredAt) return 1;
                if (!b.expiredAt) return -1;
                return b.expiredAt.getTime() - a.expiredAt.getTime();
            case "rarity_asc":
                return this.rarityOrder[a.rarity] - this.rarityOrder[b.rarity];
            case "rarity_desc":
                return this.rarityOrder[b.rarity] - this.rarityOrder[a.rarity];
            case "title_asc":
                return a.title.localeCompare(b.title, "zh-CN");
            case "title_desc":
                return b.title.localeCompare(a.title, "zh-CN");
            case "type_asc":
                return a.type.localeCompare(b.type, "zh-CN");
            case "type_desc":
                return b.type.localeCompare(a.type, "zh-CN");
            default:
                return 0;
            }
        });
    }

    /**
     * 过滤头衔
     * @param titles 头衔列表
     * @param filter 过滤条件
     */
    private filterTitles(titles: TitleBase[], filter: TitleFilter): TitleBase[] {
        return titles.filter((title) => {
            // 状态过滤
            if (filter.status && filter.status.length > 0) {
                if (!filter.status.includes(title.status)) {
                    return false;
                }
            }

            // 类型过滤
            if (filter.type && filter.type.length > 0) {
                if (!filter.type.includes(title.type)) {
                    return false;
                }
            }

            // 稀有度过滤
            if (filter.rarity && filter.rarity.length > 0) {
                if (!filter.rarity.includes(title.rarity as any)) {
                    return false;
                }
            }

            // 搜索关键词过滤
            if (filter.searchKeyword) {
                const keyword = filter.searchKeyword.toLowerCase();
                if (
                    !title.title.toLowerCase().includes(keyword) &&
                    !title.description.toLowerCase().includes(keyword) &&
                    !title.type.toLowerCase().includes(keyword)
                ) {
                    return false;
                }
            }

            // 时限过滤
            if (filter.timeLimit !== undefined) {
                const isTimeLimited = !!title.expiredAt;
                if (filter.timeLimit !== isTimeLimited) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * 获取显示头衔列表
     * @param config 显示配置
     */
    getDisplayTitles(config: TitleDisplayConfig): TitleDisplayItem[] {
        let titles = titleLibrary.getAllTitles();

        // 过滤
        if (config.filter) {
            titles = this.filterTitles(titles, config.filter);
        }

        // 排序
        if (config.sortBy) {
            titles = this.sortTitles(titles, config.sortBy);
        }

        // 限制数量
        if (config.limit) {
            titles = titles.slice(0, config.limit);
        }

        // 转换为显示项
        return titles.map((title) => this.convertToDisplayItem(title));
    }

    /**
     * 获取头衔墙（用户或战队的头衔展示）
     * @param recipientId 接收者ID
     * @param recipientType 接收者类型
     * @param config 显示配置
     */
    getTitleWall(
        _recipientId: string,
        _recipientType: "user" | "clan",
        config: TitleDisplayConfig = {}
    ): TitleDisplayItem[] {
        // TODO: 根据接收者类型获取特定头衔
        return this.getDisplayTitles({
            ...config,
            sortBy: config.sortBy || "rarity_desc",
            limit: config.limit || 20
        });
    }

    /**
     * 获取头衔统计信息
     */
    getTitleStatistics(): Record<string, any> {
        const titles = titleLibrary.getAllTitles();

        // 状态统计
        const statusStats = titles.reduce<Record<string, number>>((acc, title) => {
            acc[title.status] = (acc[title.status] || 0) + 1;
            return acc;
        }, {});

        // 类型统计
        const typeStats = titles.reduce<Record<string, number>>((acc, title) => {
            acc[title.type] = (acc[title.type] || 0) + 1;
            return acc;
        }, {});

        // 稀有度统计
        const rarityStats = titles.reduce<Record<string, number>>((acc, title) => {
            acc[title.rarity] = (acc[title.rarity] || 0) + 1;
            return acc;
        }, {});

        // 时限统计
        const timeLimitStats = titles.reduce<Record<string, number>>((acc, title) => {
            const key = title.expiredAt ? "timeLimited" : "permanent";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return {
            total: titles.length,
            byStatus: statusStats,
            byType: typeStats,
            byRarity: rarityStats,
            byTimeLimit: timeLimitStats
        };
    }

    /**
     * 获取成就进度
     * @param recipientId 接收者ID
     * @param recipientType 接收者类型
     */
    getAchievementProgress(
        _recipientId: string,
        _recipientType: "user" | "clan"
    ): Record<string, any> {
        // TODO: 实现成就进度逻辑
        return {
            totalAvailable: titleLibrary.getSize(),
            totalObtained: Math.floor(titleLibrary.getSize() * 0.3),
            progressPercentage: 30,
            recentObtained: [],
            nextAvailable: []
        };
    }

    /**
     * 生成徽章信息
     * @param title 头衔对象
     * @param size 徽章大小
     */
    generateBadgeInfo(
        title: TitleBase,
        size: "small" | "medium" | "large" = "medium"
    ): Record<string, any> {
        const sizeConfig = {
            small: { width: 40, height: 40, fontSize: 12 },
            medium: { width: 60, height: 60, fontSize: 14 },
            large: { width: 100, height: 100, fontSize: 18 }
        };

        return {
            id: title.id,
            title: title.title,
            image: title.image,
            rarity: title.rarity,
            status: title.status,
            size: sizeConfig[size],
            cssClass: `title-badge title-badge-${size} title-badge-${title.rarity} title-badge-${title.status}`,
            tooltip: {
                title: title.title,
                description: title.description,
                rarity: this.getRarityLabel(title.rarity),
                type: title.type,
                expiredAt: title.expiredAt
            }
        };
    }

    /**
     * 获取稀有度颜色
     * @param rarity 稀有度
     */
    getRarityColor(rarity: string): string {
        const colors: Record<string, string> = {
            common: "#888888",
            rare: "#4A90E2",
            epic: "#9B59B6",
            legendary: "#F1C40F"
        };
        return colors[rarity] || colors.common;
    }

    /**
     * 获取状态颜色
     * @param status 状态
     */
    getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            active: "#2ECC71",
            inactive: "#95A5A6",
            expired: "#E74C3C",
            pending: "#F39C12"
        };
        return colors[status] || colors.inactive;
    }

    /**
     * 搜索头衔
     * @param keyword 搜索关键词
     * @param config 显示配置
     */
    searchTitles(
        keyword: string,
        config: Omit<TitleDisplayConfig, "filter"> = {}
    ): TitleDisplayItem[] {
        return this.getDisplayTitles({
            ...config,
            filter: { searchKeyword: keyword },
            sortBy: config.sortBy || "title_asc"
        });
    }

    /**
     * 获取推荐头衔
     * @param limit 数量限制
     */
    getRecommendedTitles(limit: number = 10): TitleDisplayItem[] {
        return this.getDisplayTitles({
            sortBy: "rarity_desc",
            filter: {
                status: ["active"],
                timeLimit: false
            },
            limit: limit
        });
    }
}

// 创建单例实例
export const titleDisplayService = new TitleDisplayService();
