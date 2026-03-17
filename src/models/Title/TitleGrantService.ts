import mongoose from "mongoose";
import { Title, TitleGrantRecord, ITitleGrantRecord } from "./TitleModel";
import UserTitleService from "./UserTitleService";
import ClanTitleService from "./ClanTitleService";
import { TitleCondition } from "./index";

/**
 * 这是什么？
 * 
 */
export interface TitleGrantRule {
    id: string;
    titleId: mongoose.Types.ObjectId;
    condition: TitleCondition;
    autoGrant: boolean;
    priority: number;
    validFrom: Date;
    validTo?: Date;
    description: string;
}

export interface TitleGrantOptions {
    titleId: mongoose.Types.ObjectId;
    recipientType: "user" | "clan";
    recipientId: mongoose.Types.ObjectId;
    grantType: "auto" | "manual";
    grantedBy: mongoose.Types.ObjectId;
    reason?: string;
    metadata?: Record<string, unknown>;
}

export interface GrantRecordQueryOptions {
    titleId?: mongoose.Types.ObjectId;
    recipientType?: "user" | "clan";
    recipientId?: mongoose.Types.ObjectId;
    grantType?: "auto" | "manual";
    grantedBy?: mongoose.Types.ObjectId;
    status?: ("granted" | "revoked" | "expired")[];
    grantedAtFrom?: Date;
    grantedAtTo?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;

}
/**
 * TitleGrantService - 负责头衔授予相关业务逻辑
 */
export class TitleGrantService {
    grantRules = new Map<string, TitleGrantRule>();



    /**
     * 添加头衔授予规则
     * @param rule 授予规则
     */
    addGrantRule(rule: TitleGrantRule): void {
        this.grantRules.set(rule.id, rule);
        console.log(`Grant rule added: ${rule.id}`);
    }

    /**
     * 移除头衔授予规则
     * @param ruleId 规则ID
     */
    removeGrantRule(_ruleId: string): boolean {
        // todo 未实现
        return true;
    }

    /**
     * 获取头衔授予规则
     * @param ruleId 规则ID
     */
    getGrantRule(ruleId: string): TitleGrantRule | undefined {
        return this.grantRules.get(ruleId);
    }

    /**
     获取所有有效的自动授予规则
     */
    getValidGrantRules(): TitleGrantRule[] {
        const now = new Date();
        return Array.from(this.grantRules.values())
            .filter((rule) => {
                return rule.autoGrant && now >= rule.validFrom && (!rule.validTo || now <= rule.validTo);
            })
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * 检查等级条件
     */
    private checkLevelCondition(condition: TitleCondition, recipientData: Record<string, unknown>): boolean {
        if (!condition.level) return true;
        return (recipientData.level as number) >= condition.level;
    }

    /**
     * 检查成就条件
     */
    private checkAchievementsCondition(condition: TitleCondition, recipientData: Record<string, unknown>): boolean {
        if (!condition.requiredAchievements || condition.requiredAchievements.length === 0) return true;
        const achievements = recipientData.achievements as string[] || [];
        return condition.requiredAchievements.every(achievement => achievements.includes(achievement));
    }

    /**
     * 检查荣誉条件
     */
    private checkHonorsCondition(condition: TitleCondition, recipientData: Record<string, unknown>): boolean {
        if (!condition.requiredHonors || condition.requiredHonors.length === 0) return true;
        const honors = recipientData.honors as string[] || [];
        return condition.requiredHonors.every(honor => honors.includes(honor));
    }

    /**
     * 检查积分条件
     */
    private checkPointsCondition(condition: TitleCondition, recipientData: Record<string, unknown>): boolean {
        if (!condition.points) return true;
        return (recipientData.points as number) >= condition.points;
    }

    /**
     * 检查条件是否满足
     * @param condition 条件
     * @param recipientData 接收者数据
     */
    checkCondition(condition: TitleCondition, recipientData: Record<string, unknown>): boolean {
        return this.checkLevelCondition(condition, recipientData) &&
               this.checkAchievementsCondition(condition, recipientData) &&
               this.checkHonorsCondition(condition, recipientData) &&
               this.checkPointsCondition(condition, recipientData);
    }

    /**
     * 检查自动授予头衔  
     * @param recipientType 接收者类型
     * @param recipientId 接收者ID
     * @param recipientData 接收者数据
     */
    async checkAutoGrant(
        recipientType: "user" | "clan",
        recipientId: mongoose.Types.ObjectId,
        recipientData: Record<string, unknown>
    ): Promise<number> {
        const rules = this.getValidGrantRules();
        let grantedCount = 0;

        for (const rule of rules) {
            try {

                if (this.checkCondition(rule.condition, recipientData)) {
                    // 授予头衔
                    await TitleGrantService.grantTitle({
                        titleId: rule.titleId,
                        recipientType,
                        recipientId,
                        grantType: "auto",
                        grantedBy: new mongoose.Types.ObjectId("000000000000000000000000"),
                        reason: `Auto granted by rule ${rule.id}`,
                        metadata: { ruleId: rule.id }
                    });
                    grantedCount++;
                }
            } catch (error) {
                // 忽略已存在的错误
                if (
                    (error as Error).message !== "User already has this title" &&
                    (error as Error).message !== "Clan already has this title"
                ) {
                    console.error(`Failed to auto grant title ${rule.titleId}:`, error);
                }
            }
        }

        return grantedCount;
    }

    /**
     * 授予头衔
     * @param options 授予选项
     */
    static async grantTitle(options: TitleGrantOptions): Promise<ITitleGrantRecord> {
        const title = await Title.findById(options.titleId);
        if (!title) {
            throw new Error("Title not found");
        }

        const record = new TitleGrantRecord({
            recordId: `${options.recipientType}${options.titleId}${Date.now()}`,
            titleId: options.titleId,
            recipientType: options.recipientType,
            recipientId: options.recipientId,
            grantType: options.grantType,
            grantedBy: options.grantedBy,
            reason: options.reason,
            metadata: options.metadata,
            expireAt: title.expiredAt
        });
        await record.save();

        // 根据接收者类型授予头衔
        if (options.recipientType === "user") {
            await UserTitleService.grantTitleToUser(options.recipientId, {
                titleId: options.titleId,
                metadata: options.metadata
            });
        } else {    
            await ClanTitleService.grantTitleToClan(options.recipientId, {
                titleId: options.titleId,
                metadata: options.metadata
            });
        }

        return record;
    }

    /**
     * 撤销头衔
     * @param recordId 记录ID
     * @param revokedBy 撤销者ID
 * @param reason 撤销原因
     */
    static async revokeTitle(
        recordId: string,
        revokedBy: mongoose.Types.ObjectId,
        reason: string
    ): Promise<ITitleGrantRecord | null> {
        const record = await TitleGrantRecord.findOne({ recordId });
        if (!record) {
         
     
            return null;
        }

        // 更新记录状态
        record.status = "revoked";
        record.metadata = {
            ...record.metadata,
            revokedBy,
            revokedAt: new Date(),
            revokeReason: reason
        };
    

    


        await record.save();

        // 根据类型撤销头衔
        if (record.recipientType === "user") {
            // 撤销用户头衔
            // 这里需要调用UserTitleService的撤销方法
        } else {
            // 撤销战队头衔
            // 这里需要调用ClanTitleService的撤销方法
        }

        return record;
    }

    /**
     * 构建授予记录查询条件
     */
    private static buildGrantRecordQuery(options: GrantRecordQueryOptions): Record<string, unknown> {
        const query: Record<string, unknown> = {};

        if (options.titleId) {
            query.titleId = options.titleId;
        }
        if (options.recipientType) {
            query.recipientType = options.recipientType;
        }
        if (options.recipientId) {
            query.recipientId = options.recipientId;
        }
        if (options.grantType) {
            query.grantType = options.grantType;
        }
        if (options.grantedBy) {
            query.grantedBy = options.grantedBy;
        }
        if (options.status && options.status.length > 0) {
            query.status = { $in: options.status };
        }
        if (options.grantedAtFrom) {
            query.grantedAt = { $gte: options.grantedAtFrom };
        }
        if (options.grantedAtTo) {
            query.grantedAt = { ...query.grantedAt, $lte: options.grantedAtTo };
        }

        return query;
    }

    /**
     * 构建排序配置
     */
    private static buildSortConfig(options: GrantRecordQueryOptions): Record<string, 1 | -1 | "asc" | "desc"> {
        const sort: Record<string, 1 | -1 | "asc" | "desc"> = {};
        if (options.sortBy) {
            sort[options.sortBy] = options.sortOrder || "asc";
        } else {
            sort.grantedAt = "desc";
        }
        return sort;
    }

    /**
     * 获取授予记录列表
     * @param options 查询选项
     */
    static async getGrantRecords(options: GrantRecordQueryOptions = {}): Promise<{
        records: ITitleGrantRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // 构建查询条件
        const query = this.buildGrantRecordQuery(options);

        // 分页和排序
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // 排序配置
        const sort = this.buildSortConfig(options);

        // 执行查询
        const [records, total] = await Promise.all([
            TitleGrantRecord.find(query)
                .populate("titleId")
                .sort(sort)
                .skip(skip)
                .limit(limit),
            TitleGrantRecord.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);
        return {
            records,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 获取单个授予记录
     * @param recordId 记录ID
     */
    static async getGrantRecord(recordId: string): Promise<ITitleGrantRecord | null> {
        return TitleGrantRecord.findOne({ recordId }).populate("titleId");
    }

    /**
     * 根据接收者获取授予记录
     * @param recipientType 接收者类型
     * @param recipientId 接收者ID
     * @param options 查询选项
     */
    static async getGrantRecordsByRecipient(
        recipientType: "user" | "clan",
        recipientId: mongoose.Types.ObjectId,
        options: Omit<GrantRecordQueryOptions, "recipientType" | "recipientId"> = {}
    ): Promise<{
        records: ITitleGrantRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.getGrantRecords({
            ...options,
            recipientType,
            recipientId
        });
    }

    /**
     * 根据头衔获取授予记录
     * @param titleId 头衔ID
     * @param options 查询选项
     */
    static async getGrantRecordsByTitle(
        titleId: mongoose.Types.ObjectId,
        options: Omit<GrantRecordQueryOptions, "titleId"> = {}
    ): Promise<{
        records: ITitleGrantRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.getGrantRecords({
            ...options,
            titleId
        });
    }

    /**
     * 构建统计查询条件
     */
    private static buildStatisticsQuery(
        options: Omit<GrantRecordQueryOptions, "page" | "limit" | "sortBy" | "sortOrder">
    ): Record<string, unknown> {
        const query: Record<string, unknown> = {};

        if (options.titleId) {
            query.titleId = options.titleId;
        }
        if (options.recipientType) {
            query.recipientType = options.recipientType;
        }
        if (options.grantType) {
            query.grantType = options.grantType;
        }
        if (options.grantedBy) {
            query.grantedBy = options.grantedBy;
        }
        if (options.status && options.status.length > 0) {
            query.status = { $in: options.status };
        }
        if (options.grantedAtFrom) {
            query.grantedAt = { $gte: options.grantedAtFrom };
        }
        if (options.grantedAtTo) {
            query.grantedAt = { ...query.grantedAt, $lte: options.grantedAtTo };
        }

        return query;
    }

    /**
     * 执行聚合查询
     */
    private static async executeAggregationQueries(query: Record<string, unknown>) {
        return await Promise.all([
            TitleGrantRecord.countDocuments(query),
            TitleGrantRecord.aggregate([
                { $match: query },
                { $group: { _id: "$recipientType", count: { $sum: 1 } } }
            ]),
            TitleGrantRecord.aggregate([
                { $match: query },
                { $group: { _id: "$grantType", count: { $sum: 1 } } }
            ]),
            TitleGrantRecord.aggregate([
                { $match: query },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            TitleGrantRecord.aggregate([
                { $match: query },
                { $group: { _id: "$titleId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);
    }

    /**
     * 格式化聚合结果
     */
    private static formatAggregationResults(results: [
        number,
        Array<{ _id: string; count: number }>,
        Array<{ _id: string; count: number }>,
        Array<{ _id: string; count: number }>,
        Array<{ _id: mongoose.Types.ObjectId; count: number }>
    ]) {
        const [totalCount, byRecipientType, byGrantType, byStatus, byTitle] = results;

        // 格式化统计结果
        return {
            total: totalCount,
            byRecipientType: byRecipientType.reduce(
                (acc: Record<string, number>, item: { _id: string, count: number }) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
            byGrantType: byGrantType.reduce((acc: Record<string, number>, item: { _id: string, count: number }) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc: Record<string, number>, item: { _id: string, count: number }) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            topTitles: byTitle
        };
    }

    /**
     * 获取授予统计信息
     * @param options 查询选项
     */
    static async getGrantStatistics(
        options: Omit<GrantRecordQueryOptions, "page" | "limit" | "sortBy" | "sortOrder"> = {}
    ): Promise<Record<string, unknown>> {
        // 构建查询条件
        const query = this.buildStatisticsQuery(options);

        // 执行聚合查询
        const results = await this.executeAggregationQueries(query);

        // 格式化统计结果
        return this.formatAggregationResults(results);
    }
}
