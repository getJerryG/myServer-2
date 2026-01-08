import Transaction from "../data/transaction";
import { ITransaction, TransactionType, TransactionStatus } from "../types/currency";
import UserService from "../../User/services/userService";

/**
 * 交易服务类
 */
export default class TransactionService {
    /**
     * 获取用户交易记录
     * @param userId 用户ID
     * @param page 页码，默认1
     * @param pageSize 每页数量，默认10
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param transactionType 交易类型
     * @param currencyType 货币类型
     * @returns 交易记录列表和总数
     */
    static async getUserTransactions(
        userId: number,
        page = 1,
        pageSize = 10,
        startTime?: Date,
        endTime?: Date,
        transactionType?: TransactionType,
        currencyType?: string
    ): Promise<{ list: ITransaction[]; total: number }> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user) {
                return { list: [], total: 0 };
            }

            // 构建查询条件
            const query: Partial<ITransaction> = { userId: user._id };
            
            // 时间范围条件
            if (startTime && endTime) {
                query.createdAt = { $gte: startTime, $lte: endTime };
            } else if (startTime) {
                query.createdAt = { $gte: startTime };
            } else if (endTime) {
                query.createdAt = { $lte: endTime };
            }

            // 交易类型条件
            if (transactionType) {
                query.transactionType = transactionType;
            }
            
            // 货币类型条件
            if (currencyType) {
                query.currencyType = currencyType;
            }
            
            // 获取总数
            const total = await Transaction.countDocuments(query);

            // 分页查询
            const skip = (page - 1) * pageSize;
            const list = await Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize);
            
            return { list, total };
        } catch (error) {
            console.error(`获取用户交易记录失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 根据ID获取交易记录
     * @param id 交易ID
     * @returns 交易记录或null
     */
    static async getTransactionById(id: string): Promise<ITransaction | null> {
        try {
            return await Transaction.findById(id);
        } catch (error) {
            console.error(`获取交易记录失败 ${id}:`, error);
            throw error;
        }
    }

    /**
     * 导出用户交易记录
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @returns 交易记录列表
     */
    static async exportTransactions(
        userId: number,
        startTime?: Date,
        endTime?: Date
    ): Promise<ITransaction[]> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user) {
                return [];
            }
            
            // 构建查询条件
            const query: Partial<ITransaction> = { userId: user._id };
            
            // 时间范围条件
            if (startTime && endTime) {
                query.createdAt = { $gte: startTime, $lte: endTime };
            } else if (startTime) {
                query.createdAt = { $gte: startTime };
            } else if (endTime) {
                query.createdAt = { $lte: endTime };
            }

            // 获取所有符合条件的记录
            return await Transaction.find(query).sort({ createdAt: 1 });
        } catch (error) {
            console.error(`导出用户交易记录失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 获取交易总金额
     * @param userId 用户ID
     * @param transactionType 交易类型
     * @param currencyType 货币类型
     * @returns 交易总金额
     */
    static async getTransactionTotal(
        userId: number,
        transactionType: TransactionType,
        currencyType: string
    ): Promise<number> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user) {
                return 0;
            }
            
            // 构建查询条件
            const query = {
                userId: user._id,
                transactionType,
                currencyType,
                status: TransactionStatus.SUCCESS
            };
            
            // 聚合查询总金额
            const result = await Transaction.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            
            return result[0]?.total || 0;
        } catch (error) {
            console.error(`获取交易总金额失败 ${userId} ${transactionType} ${currencyType}:`, error);
            throw error;
        }
    }

    /**
     * 更新交易状态
     * @param id 交易ID
     * @param status 新状态
     * @returns 更新后的交易记录或null
     */
    static async updateTransactionStatus(
        id: string,
        status: TransactionStatus
    ): Promise<ITransaction | null> {
        try {
            return await Transaction.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );
        } catch (error) {
            console.error(`更新交易状态失败 ${id}:`, error);
            throw error;
        }
    }
}