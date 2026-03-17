import TitleBase, { TitleStatus, TitleCondition, TitleType, titleLibrary, TitleStatusType } from "./index";
import { Title, ITitle } from "./TitleModel";
import TitleCacheService, { TitleCacheKeys } from "./TitleCacheService";
import DBOptimizer from "../../utils/dbOptimizer";

/**
 * 头衔创建选项接口
 */
export interface TitleCreateOptions {
    title: string;
    type: TitleType;
    description: string;
    image?: string;
    status?: string;
    expiredAt?: Date;
    conditions?: TitleCondition;
    category?: string;
    rarity?: "common" | "rare" | "epic" | "legendary";
    isTimeLimited?: boolean;
}

/**
 * 头衔更新选项类型
 */
export type TitleUpdateOptions = Partial<TitleCreateOptions>;

/**
 * 头衔查询选项接口
 */
export interface TitleQueryOptions {
    status?: string[];
    type?: TitleType[];
    category?: string[];
    rarity?: ("common" | "rare" | "epic" | "legendary")[];
    searchKeyword?: string;
    isTimeLimited?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

/**
 * 头衔服务类
 * 处理头衔的创建、查询、更新、删除等操作
 */
export default class TitleService {
    /**
     * 检查头衔是否存在
     * @param title 头衔名称
     * @param excludeId 排除的头衔ID
     * @returns 是否存在
     */
    static async checkTitleExists(title: string, excludeId?: string): Promise<boolean> {
        const query: Record<string, unknown> = { title };
        
        if (excludeId) {
            query.id = { $ne: excludeId };
        }
        
        return await DBOptimizer.exists(Title, query);
    }

    /**
     * 创建头衔
     * @param options 头衔创建选项
     * @returns 创建的头衔
     */
    static async createTitle(options: TitleCreateOptions): Promise<ITitle> {
        // 检查头衔是否已存在
        const exists = await this.checkTitleExists(options.title);
        if (exists) {
            throw new Error(`头衔 "${options.title}" 已存在`);
        }

        // 创建新头衔
        const title = new Title({
            id: `${options.type}${options.title}${Date.now()}`,
            title: options.title,
            type: options.type,
            description: options.description,
            image: options.image,
            status: options.status || TitleStatus.ACTIVE,
            expiredAt: options.expiredAt,
            conditions: options.conditions || {},
            category: options.category || "default",
            rarity: options.rarity || "common",
            isTimeLimited: options.isTimeLimited || !!options.expiredAt
        });

        const savedTitle = await title.save();

        // 添加到TitleLibrary
        const titleBase = new TitleBase(savedTitle.title, savedTitle.type, savedTitle.description, {
            id: savedTitle.id,
            image: savedTitle.image,
            status: savedTitle.status as TitleStatusType,
            expiredAt: savedTitle.expiredAt,
            conditions: savedTitle.conditions,
            category: savedTitle.category,
            rarity: savedTitle.rarity
        });
        
        titleLibrary.addTitle(titleBase);

        // 缓存头衔
        await TitleCacheService.cacheTitle(savedTitle);
        
        return savedTitle;
    }

    /**
     * 根据头衔名称获取头衔
     * @param title 头衔名称
     * @returns 头衔对象
     */
    static async getTitleByTitle(title: string): Promise<ITitle | null> {
        return await Title.findOne({ title });
    }

    /**
     * 根据ID获取头衔
     * @param id 头衔ID
     * @returns 头衔对象
     */
    static async getTitleById(id: string): Promise<ITitle | null> {
        // 尝试从缓存获取
        const cachedTitle = await TitleCacheService.getTitleFromCache(id);
        if (cachedTitle) {
            return cachedTitle;
        }

        // 从数据库获取
        const title = await Title.findOne({ id });
        if (title) {
            // 更新缓存
            await TitleCacheService.cacheTitle(title);
        }
        
        return title;
    }

    /**
     * 更新头衔
     * @param id 头衔ID
     * @param options 头衔更新选项
     * @returns 更新后的头衔
     */
    static async updateTitle(
        id: string,
        options: TitleUpdateOptions
    ): Promise<ITitle | null> {
        // 检查头衔是否已存在（排除当前ID）
        if (options.title) {
            const exists = await this.checkTitleExists(options.title, id);
            if (exists) {
                throw new Error(`头衔 "${options.title}" 已存在`);
            }
        }

        // 更新头衔
        const updatedTitle = await Title.findOneAndUpdate(
            { id },
            { ...options, updatedAt: new Date() },
            { new: true }
        );

        if (updatedTitle) {
            // 更新TitleLibrary
            const existingTitle = titleLibrary.getTitleById(id);
            if (existingTitle) {
                existingTitle.updateInfo({
                    title: updatedTitle.title,
                    type: updatedTitle.type,
                    description: updatedTitle.description,
                    image: updatedTitle.image,
                    status: updatedTitle.status as TitleStatusType,
                    expiredAt: updatedTitle.expiredAt,
                    conditions: updatedTitle.conditions,
                    category: updatedTitle.category,
                    rarity: updatedTitle.rarity
                });
            }

            // 更新缓存
            await TitleCacheService.refreshAllCaches(updatedTitle);
        }
        
        return updatedTitle;
    }

    /**
     * 删除头衔
     * @param id 头衔ID
     * @returns 是否成功删除
     */
    static async deleteTitle(id: string): Promise<boolean> {
        const result = await Title.deleteOne({ id });
        
        if (result.deletedCount > 0) {
            // 从TitleLibrary移除
            titleLibrary.titles.delete(id);
            
            // 更新缓存
            await TitleCacheService.deleteTitleCache(id);
            await TitleCacheService.invalidateCategoryCaches({ id });
            await TitleCacheService.deleteTitleListCache(TitleCacheKeys.POPULAR_TITLES);
            await TitleCacheService.deleteTitleListCache(TitleCacheKeys.TITLE_STATS);
            
            return true;
        }
        
        return false;
    }

    /**
     * 添加状态筛选条件
     */
    private static addStatusFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.status && options.status.length > 0) {
            query.status = { $in: options.status };
        }
    }

    /**
     * 添加类型筛选条件
     */
    private static addTypeFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.type && options.type.length > 0) {
            query.type = { $in: options.type };
        }
    }

    /**
     * 添加分类筛选条件
     */
    private static addCategoryFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.category && options.category.length > 0) {
            query.category = { $in: options.category };
        }
    }

    /**
     * 添加稀有度筛选条件
     */
    private static addRarityFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.rarity && options.rarity.length > 0) {
            query.rarity = { $in: options.rarity };
        }
    }

    /**
     * 添加时间限制筛选条件
     */
    private static addTimeLimitedFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.isTimeLimited !== undefined) {
            query.isTimeLimited = options.isTimeLimited;
        }
    }

    /**
     * 添加搜索关键词筛选条件
     */
    private static addSearchFilter(query: Record<string, unknown>, options: TitleQueryOptions) {
        if (options.searchKeyword) {
            const keyword = new RegExp(options.searchKeyword, "i");
            query.$or = [{ title: keyword }, { description: keyword }];
        }
    }

    /**
     * 构建头衔查询条件
     * @param options 查询选项
     */
    private static buildTitleQuery(options: TitleQueryOptions): Record<string, unknown> {
        const query: Record<string, unknown> = {};
        
        this.addStatusFilter(query, options);
        this.addTypeFilter(query, options);
        this.addCategoryFilter(query, options);
        this.addRarityFilter(query, options);
        this.addTimeLimitedFilter(query, options);
        this.addSearchFilter(query, options);

        return query;
    }

    /**
     * 构建头衔排序配置
     * @param options 查询选项
     */
    private static buildTitleSort(options: TitleQueryOptions): Record<string, 1 | -1> {
        const sort: Record<string, 1 | -1> = {};
        if (options.sortBy) {
            sort[options.sortBy] = options.sortOrder || "asc";
        } else {
            sort.createdAt = "desc";
        }
        return sort;
    }

    /**
     * 查询头衔列表
     * @param options 查询选项
     * @returns 头衔列表及分页信息
     */
    static async queryTitles(
        options: TitleQueryOptions = {}
    ): Promise<{ titles: ITitle[]; total: number; page: number; limit: number; totalPages: number }> {
        // 构建查询条件
        const query = this.buildTitleQuery(options);

        // 分页参数
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // 排序参数
        const sort = this.buildTitleSort(options);

        // 执行查询
        const [titles, total] = await Promise.all([
            Title.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Title.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            titles,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 获取热门头衔
     * @param limit 限制数量
     * @returns 热门头衔列表
     */
    static async getPopularTitles(limit = 20): Promise<ITitle[]> {
        // 尝试从缓存获取
        const cachedTitles = await TitleCacheService.getTitleListFromCache(TitleCacheKeys.POPULAR_TITLES);
        if (cachedTitles) {
            return cachedTitles;
        }

        // 从数据库获取
        const titles = await Title.find({
            status: TitleStatus.ACTIVE
        })
            .sort({ rarity: -1, createdAt: -1 })
            .limit(limit);
        
        // 缓存结果
        await TitleCacheService.cacheTitleList(TitleCacheKeys.POPULAR_TITLES, titles);
        
        return titles;
    }

    /**
     * 获取即将过期的头衔
     * @param days 天数
     * @param limit 限制数量
     * @returns 即将过期的头衔列表
     */
    static async getExpiringTitles(days = 7, limit = 20): Promise<ITitle[]> {
        const now = new Date();
        const expireEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        // 生成缓存键
        const cacheKey = TitleCacheKeys.EXPIRING_TITLES(days);
        
        // 尝试从缓存获取
        const cachedTitles = await TitleCacheService.getTitleListFromCache(cacheKey);
        if (cachedTitles) {
            return cachedTitles;
        }

        // 从数据库获取
        const titles = await Title.find({
            status: TitleStatus.ACTIVE,
            isTimeLimited: true,
            expiredAt: { $gt: now, $lte: expireEnd }
        })
            .sort({ expiredAt: 1 })
            .limit(limit);
        
        // 缓存结果
        await TitleCacheService.cacheTitleList(cacheKey, titles);
        
        return titles;
    }

    /**
     * 批量更新头衔状态
     * @param ids 头衔ID列表
     * @param status 新状态
     * @returns 更新结果
     */
    static async batchUpdateStatus(
        ids: string[],
        status: string
    ): Promise<{ updatedCount: number }> {
        const result = await Title.updateMany(
            { id: { $in: ids } },
            { status, updatedAt: new Date() }
        );
        
        // 清除相关缓存
        for (const id of ids) {
            await TitleCacheService.deleteTitleCache(id);
        }
        
        // 清除列表缓存
        await TitleCacheService.deleteTitleListCache(TitleCacheKeys.POPULAR_TITLES);
        await TitleCacheService.deleteTitleListCache(TitleCacheKeys.TITLE_STATS);
        
        return { updatedCount: result.modifiedCount };
    }

    /**
     * 检查并更新过期头衔
     * @returns 过期的头衔数量
     */
    static async checkAndUpdateExpiredTitles(): Promise<number> {
        const now = new Date();
        
        // 更新过期头衔
        const result = await Title.updateMany(
            {
                status: TitleStatus.ACTIVE,
                isTimeLimited: true,
                expiredAt: { $lt: now }
            },
            {
                status: TitleStatus.EXPIRED,
                updatedAt: new Date()
            }
        );
        
        if (result.modifiedCount > 0) {
            // 清除相关缓存
            await TitleCacheService.deleteTitleListCache(TitleCacheKeys.POPULAR_TITLES);
            await TitleCacheService.deleteTitleListCache(TitleCacheKeys.TIME_LIMITED_TITLES);
            await TitleCacheService.deleteTitleListCache(TitleCacheKeys.TITLE_STATS);
        }
        
        return result.modifiedCount;
    }

    /**
     * 获取头衔统计信息
     * @returns 头衔统计信息
     */
    static async getTitleStatistics(): Promise<Record<string, unknown>> {
        // 尝试从缓存获取
        const cachedStats = await TitleCacheService.getTitleStatsFromCache();
        if (cachedStats) {
            return cachedStats;
        }

        // 从数据库获取统计信息
        const [totalCount, statusStats, typeStats, rarityStats, timeLimitedStats] = await Promise.all([
            Title.countDocuments(),
            Title.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            Title.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
            Title.aggregate([{ $group: { _id: "$rarity", count: { $sum: 1 } } }]),
            Title.aggregate([{ $group: { _id: "$isTimeLimited", count: { $sum: 1 } } }])
        ]);

        // 格式化统计信息
        const stats = {
            total: totalCount,
            byStatus: statusStats.reduce((acc: Record<string, number>, item: { _id: string, count: number }) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byType: typeStats.reduce((acc: Record<string, number>, item: { _id: string, count: number }) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byRarity: rarityStats.reduce((acc: Record<string, number>, item: { _id: string, count: number }) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byTimeLimited: timeLimitedStats.reduce(
                (acc: Record<string, number>, item: { _id: boolean, count: number }) => {
                    acc[item._id ? "timeLimited" : "permanent"] = item.count;
                    return acc;
                }, {}),
        };

        // 缓存统计信息
        await TitleCacheService.cacheTitleStats(stats);
        
        return stats;
    }

    /**
     * 从库同步头衔
     * @returns 同步的头衔数量
     */
    static async syncFromLibrary(): Promise<number> {
        const titles = titleLibrary.getAllTitles();
        let syncedCount = 0;
        
        for (const title of titles) {
            // 检查头衔是否已存在
            const existing = await DBOptimizer.exists(Title, { id: title.id });
            if (!existing) {
                // 创建新头衔
                const newTitle = new Title({
                    id: title.id,
                    title: title.title,
                    type: title.type,
                    description: title.description,
                    image: title.image,
                    status: title.status,
                    expiredAt: title.expiredAt,
                    conditions: title.conditions,
                    category: title.category,
                    rarity: title.rarity,
                    isTimeLimited: !!title.expiredAt
                });
                
                await newTitle.save();
                syncedCount++;
            }
        }
        
        return syncedCount;
    }
}