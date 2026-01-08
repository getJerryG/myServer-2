/**
 * 数据库优化器工具
 */

import { Model, Document, FilterQuery } from 'mongoose';

/**
 * 数据库优化器类
 */
export class DBOptimizer {
    /**
     * 获取实体ID
     * @param model 模型
     * @param query 查询条件
     * @param idField ID字段
     * @returns 实体ID或null
     */
    static async getEntityId<T extends Document>(
        model: Model<T>,
        query: FilterQuery<T>,
        idField: string = '_id'
    ): Promise<string | null> {
        try {
            const entity = await model.findOne(query).select(idField).lean() as Record<string, any>;
            if (!entity) {
                return null;
            }
            return entity[idField]?.toString() || null;
        } catch (error) {
            console.error('Error getting entity ID:', error);
            return null;
        }
    }

    /**
     * 批量获取实体ID
     * @param model 模型
     * @param queries 查询条件数组
     * @param idField ID字段
     * @returns 实体ID数组
     */
    static async batchGetEntityIds<T extends Document>(
        model: Model<T>,
        queries: FilterQuery<T>[],
        idField: string = '_id'
    ): Promise<(string | null)[]> {
        try {
            const promises = queries.map(query => 
                this.getEntityId(model, query, idField)
            );
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error batch getting entity IDs:', error);
            return queries.map(() => null);
        }
    }
}
