import mongoose from "mongoose";
import { Title, ClanTitle, IClanTitle } from "./TitleModel";
import TitleCacheService from "./TitleCacheService";
import { titleLibrary } from "./index";

export interface ClanTitleOptions {
    titleId: mongoose.Types.ObjectId;
    status?: "active" | "expired" | "revoked";
    equipped?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ClanTitleQueryOptions {
    status?: ("active" | "expired" | "revoked")[];
    isTimeLimited?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

/**
 * ClanTitleService - 负责战队头衔相关业务逻辑
 */
export default class ClanTitleService {
    /**
     * 授予头衔给战队
     * @param clanId 战队ID
     * @param options 授予选项
     */
    static async grantTitleToClan(
        clanId: mongoose.Types.ObjectId,
        options: ClanTitleOptions
    ): Promise<IClanTitle> {
        const title = await Title.findById(options.titleId);
        if (!title) {
            throw new Error("Title not found");
        }

        // 检查战队是否已拥有该头衔
        const existing = await ClanTitle.findOne({
            clanId,
            titleId: options.titleId
        });

        if (existing) {
            // 如果已存在但状态是revoked或expired，重新激活
            if (existing.status === "revoked" || existing.status === "expired") {
                existing.status = options.status || "active";
                existing.metadata = options.metadata || {};
                existing.revokedAt = undefined;
                await existing.save();

                // 更新缓存
                await this.updateClanTitlesCache(clanId);
                return existing;
            } else {
                // 否则抛出错误
                throw new Error("Clan already has this title");
            }
        }

        // 创建新的战队头衔记录
        const clanTitle = new ClanTitle({
            clanId,
            titleId: options.titleId,
            status: options.status || "active",
            equipped: options.equipped || false,
            metadata: options.metadata || {}
        });

        await clanTitle.save();

        // 更新缓存
        await this.updateClanTitlesCache(clanId);
        return clanTitle;
    }

    /**
     * 从战队撤销头衔
     * @param clanId 战队ID
     * @param clanTitleId 战队头衔ID
     * @param reason 撤销原因
     */
    static async revokeTitleFromClan(
        clanId: mongoose.Types.ObjectId,
        clanTitleId: mongoose.Types.ObjectId,
        reason: string
    ): Promise<boolean> {
        const result = await ClanTitle.findOneAndUpdate(
            { _id: clanTitleId, clanId },
            {
                $set: {
                    status: "revoked",
                    revokedAt: new Date(),
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            },
            { new: true }
        );

        // 更新缓存
        if (result) {
            await this.updateClanTitlesCache(clanId);
        }

        return !!result;
    }

    /**
     * 获取战队头衔列表
     * @param clanId 战队ID
     * @param options 查询选项
     */
    static async getClanTitles(
        clanId: mongoose.Types.ObjectId,
        options: ClanTitleQueryOptions = {}
    ): Promise<{
        titles: IClanTitle[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // 构建查询条件
        const query: Record<string, unknown> = { clanId };
        
        if (options.status && options.status.length > 0) {
            query.status = { $in: options.status };
        }

        // 分页和排序
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        
        // 排序配置
        const sort: Record<string, 1 | -1> = {};
        if (options.sortBy) {
            sort[options.sortBy] = options.sortOrder || "asc";
        } else {
            sort.obtainedAt = "desc";
        }

        // 执行查询
        const [clanTitles, total] = await Promise.all([
            ClanTitle.find(query)
                .populate("titleId", "id title type description image status expiredAt category rarity isTimeLimited")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            ClanTitle.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            titles: clanTitles,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 检查战队是否拥有特定头衔
     * @param clanId 战队ID
     * @param titleId 头衔ID
     */
    static async checkClanHasTitle(
        clanId: mongoose.Types.ObjectId,
        titleId: mongoose.Types.ObjectId
    ): Promise<boolean> {
        const clanTitle = await ClanTitle.findOne({
            clanId,
            titleId,
            status: "active"
        });
        return !!clanTitle;
    }

    /**
     * 批量授予头衔给战队
     * @param clanId 战队ID
     * @param titleIds 头衔ID列表
     */
    static async batchGrantTitlesToClan(
        clanId: mongoose.Types.ObjectId,
        titleIds: mongoose.Types.ObjectId[]
    ): Promise<number> {
        let grantedCount = 0;

        for (const titleId of titleIds) {
            try {
                await this.grantTitleToClan(clanId, {
                    titleId
                });
                grantedCount++;
            } catch (error) {
                // 忽略已存在的错误，继续授予其他头衔
                if (
                    (error as Error).message !== "Clan already has this title"
                ) {
                    throw error;
                }
            }
        }

        // 更新缓存
        await this.updateClanTitlesCache(clanId);
        return grantedCount;
    }

    /**
     * 批量从战队撤销头衔
     * @param clanId 战队ID
     * @param clanTitleIds 战队头衔ID列表
     * @param reason 撤销原因
     */
    static async batchRevokeTitlesFromClan(
        clanId: mongoose.Types.ObjectId,
        clanTitleIds: mongoose.Types.ObjectId[],
        reason: string
    ): Promise<number> {
        const result = await ClanTitle.updateMany(
            { _id: { $in: clanTitleIds }, clanId },
            {
                $set: {
                    status: "revoked",
                    revokedAt: new Date(),
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            }
        );

        // 更新缓存
        await this.updateClanTitlesCache(clanId);
        return result.modifiedCount;
    }

    /**
     * 更新战队头衔缓存
     * @param clanId 战队ID
     */
    private static async updateClanTitlesCache(clanId: mongoose.Types.ObjectId): Promise<void> {
        const clanTitles = await ClanTitle.find({ clanId }).populate("titleId");

        // 更新缓存
        await TitleCacheService.cacheClanTitles(clanId.toString(), clanTitles);
    }

    /**
     * 检查并更新过期的战队头衔
     * @param clanId 战队ID
     */
    static async checkAndUpdateExpiredClanTitles(clanId: mongoose.Types.ObjectId): Promise<number> {
        const now = new Date();

        // 获取所有活跃的战队头衔
        const clanTitles = await ClanTitle.find({
            clanId,
            status: "active"
        }).populate("titleId");

        let updatedCount = 0;

        for (const clanTitle of clanTitles) {
            const title = titleLibrary.getTitleById(clanTitle.titleId.toString());
            if (title && title.checkExpiration()) {
                // 更新战队头衔状态为过期
                clanTitle.status = "expired";
                await clanTitle.save();
                updatedCount++;
            }
        }

        // 更新缓存
        if (updatedCount > 0) {
            await this.updateClanTitlesCache(clanId);
        }

        return updatedCount;
    }

    /**
     * 获取战队头衔统计信息
     * @param clanId 战队ID
     */
    static async getClanTitleStatistics(clanId: mongoose.Types.ObjectId): Promise<any> {
        const clanTitles = await ClanTitle.find({ clanId }).populate("titleId");

        // 初始化统计数据
        const stats = {
            total: clanTitles.length,
            active: 0,
            expired: 0,
            revoked: 0,
            byRarity: {
                common: 0,
                rare: 0,
                epic: 0,
                legendary: 0
            },
            byType: new Map<string, number>(),
            timeLimited: 0,
            permanent: 0
        };

        for (const clanTitle of clanTitles) {
            // 状态统计
            stats[clanTitle.status]++;

            // 稀有度和类型统计
            const title = clanTitle.titleId as any;
            if (title) {
                stats.byRarity[title.rarity]++;
                stats.byType.set(title.type, (stats.byType.get(title.type) || 0) + 1);

                // 时限统计
                if (title.isTimeLimited) {
                    stats.timeLimited++;
                } else {
                    stats.permanent++;
                }
            }
        }

        // 将Map转换为对象
        stats.byType = Object.fromEntries(stats.byType) as any;

        return stats;
    }

    /**
     * 移除战队所有头衔
     * @param clanId 战队ID
     * @param reason 移除原因
     */
    static async removeAllClanTitles(
        clanId: mongoose.Types.ObjectId,
        reason: string
    ): Promise<number> {
        const result = await ClanTitle.updateMany(
            { clanId },
            {
                $set: {
                    status: "revoked",
                    revokedAt: new Date(),
                    "metadata.revokeReason": reason,
                    "metadata.revokeTime": new Date()
                }
            }
        );

        // 更新缓存
        await this.updateClanTitlesCache(clanId);
        return result.modifiedCount;
    }

    /**
     * 获取战队头衔详情
     * @param clanId 战队ID
     * @param titleId 头衔ID
     */
    static async getClanTitleDetail(
        clanId: mongoose.Types.ObjectId,
        titleId: mongoose.Types.ObjectId
    ): Promise<IClanTitle | null> {
        return ClanTitle.findOne({
            clanId,
            titleId
        }).populate("titleId");
    }

    /**
     * 从缓存获取战队头衔列表
     * @param clanId 战队ID
     */
    static async getClanTitlesFromCache(
        clanId: mongoose.Types.ObjectId
    ): Promise<IClanTitle[] | undefined> {
        return TitleCacheService.getClanTitlesFromCache(clanId.toString());
    }
}
