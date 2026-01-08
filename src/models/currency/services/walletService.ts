import Wallet from "../data/wallet";
import Transaction from "../data/transaction";
import CurrencyType from "../data/currencyType";
import { IWallet, WalletType, WalletStatus, TransactionType, TransactionStatus, ITransaction } from "../types/currency";
import mongoose from "mongoose";
import UserService from "../../User/services/userService";
import PlatformWalletService from "./platformWalletService";

/**
 * 钱包服务类
 */
export default class WalletService {
    /**
     * 创建用户钱包
     * @param userId 用户ID
     * @returns 创建的钱包
     */
    static async createUserWallet(userId: number): Promise<IWallet> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user?.data?._id) {
                throw new Error(`用户不存在: ${userId}`);
            }
            
            // 检查是否已存在钱包
            const existingWallet = await this.getUserWallet(userId);
            if (existingWallet) {
                return existingWallet;
            }
            
            // 获取所有货币类型
            const currencyTypes = await CurrencyType.find({});
            
            // 初始化余额为0
            const balances = new Map<string, number>();
            currencyTypes.forEach((currencyType) => {
                balances.set(currencyType.id, 0);
            });
            
            // 创建新钱包
            const wallet = new Wallet({
                UserObjectId: user.data._id,
                type: WalletType.USER,
                balances,
                status: WalletStatus.NORMAL
            });
            
            await wallet.save();
            return wallet;
        } catch (error) {
            console.error(`创建用户钱包失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 批量创建用户钱包
     * @param userIds 用户ID列表
     * @returns 创建的钱包列表
     */
    static async batchCreateUserWallets(userIds: number[]): Promise<IWallet[]> {
        try {
            if (!userIds || userIds.length === 0) {
                return [];
            }
            
            // 获取所有用户
            const users = await Promise.all(userIds.map((userId) => UserService.getUser(userId)));
            
            // 过滤有效用户
            const validUsers = users.filter((user): user is { data: { _id: mongoose.Types.ObjectId } } => 
                !!user?.data?._id
            );
            
            if (validUsers.length === 0) {
                return [];
            }
            
            // 获取现有钱包
            const userObjectIds = validUsers.map((user) => user.data._id);
            const existingWallets = await Wallet.find({
                UserObjectId: { $in: userObjectIds },
                type: WalletType.USER
            });
            
            // 获取已存在钱包的用户ID
            const existingUserObjectIds = new Set(existingWallets.map((wallet) => 
                wallet.UserObjectId?.toString() || ""
            ));
            existingUserObjectIds.delete("");
            
            // 过滤需要创建钱包的用户
            const needCreateUsers = validUsers.filter((user) => 
                !existingUserObjectIds.has(user.data._id.toString())
            );
            
            if (needCreateUsers.length === 0) {
                return existingWallets;
            }
            
            // 获取所有货币类型
            const currencyTypes = await CurrencyType.find({});
            
            // 创建钱包
            const walletsToCreate = needCreateUsers.map((user) => {
                // 初始化余额为0
                const balances = new Map<string, number>();
                currencyTypes.forEach((currencyType) => {
                    balances.set(currencyType.id, 0);
                });
                
                return {
                    UserObjectId: user.data._id,
                    type: WalletType.USER,
                    balances: balances,
                    status: WalletStatus.NORMAL
                };
            });
            
            const createdWallets = await Wallet.insertMany(walletsToCreate);
            
            // 返回所有钱包
            return [...existingWallets, ...createdWallets];
        } catch (error) {
            console.error("批量创建用户钱包失败:", error);
            throw error;
        }
    }

    /**
     * 获取用户钱包
     * @param userId 用户ID
     * @returns 用户钱包或null
     */
    static async getUserWallet(userId: number): Promise<IWallet | null> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user?.data?._id) {
                return null;
            }
            
            // 根据用户ID查询钱包
            return await Wallet.findOne({
                UserObjectId: user.data._id,
                type: WalletType.USER
            });
        } catch (error) {
            console.error(`获取用户钱包失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 获取用户钱包余额
     * @param userId 用户ID
     * @returns 钱包余额对象
     */
    static async getWalletBalances(userId: number): Promise<Record<string, number>> {
        try {
            const wallet = await this.getUserWallet(userId);
            if (!wallet) {
                return {};
            }
            
            return Object.fromEntries(wallet.balances);
        } catch (error) {
            console.error(`获取用户钱包余额失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 获取特定货币余额
     * @param userId 用户ID
     * @param currencyType 货币类型
     * @returns 货币余额
     */
    static async getCurrencyBalance(userId: number, currencyType: string): Promise<number> {
        try {
            if (!currencyType) {
                return 0;
            }
            
            const wallet = await this.getUserWallet(userId);
            if (!wallet) {
                return 0;
            }
            
            return wallet.balances.get(currencyType) || 0;
        } catch (error) {
            console.error(`获取货币余额失败 ${userId} ${currencyType}:`, error);
            throw error;
        }
    }

    /**
     * 更新钱包状态
     * @param userId 用户ID
     * @param status 新状态
     * @returns 更新后的钱包或null
     */
    static async updateWalletStatus(userId: number, status: WalletStatus): Promise<IWallet | null> {
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user?.data?._id) {
                return null;
            }
            
            // 更新钱包状态
            return await Wallet.findOneAndUpdate(
                { UserObjectId: user.data._id, type: WalletType.USER },
                { status },
                { new: true }
            ) as IWallet | null;
        } catch (error) {
            console.error(`更新钱包状态失败 ${userId}:`, error);
            throw error;
        }
    }

    /**
     * 增加余额
     * @param userId 用户ID
     * @param currencyType 货币类型
     * @param amount 增加金额
     * @param transactionType 交易类型
     * @param description 描述
     * @param referenceId 参考ID
     * @returns 更新后的钱包和交易记录
     */
    static async increaseBalance(
        userId: number,
        currencyType: string,
        amount: number,
        transactionType: TransactionType,
        description = "",
        referenceId = ""
    ): Promise<{ wallet: IWallet; transaction: ITransaction }> {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user?.data?._id) {
                throw new Error(`用户不存在: ${userId}`);
            }
            
            // 获取或创建钱包
            let wallet = await this.getUserWallet(userId);
            if (!wallet) {
                wallet = await this.createUserWallet(userId);
            }
            
            // 更新平台钱包
            await PlatformWalletService.updatePlatformWalletBalance(currencyType, -amount, session);
            
            // 更新用户钱包余额
            const currentBalance = wallet.balances.get(currencyType) || 0;
            const newBalance = currentBalance + amount;
            wallet.balances.set(currencyType, newBalance);
            await wallet.save({ session });
            
            // 创建交易记录
            const transaction = new Transaction({
                UserObjectId: user.data._id,
                currencyType,
                amount,
                beforeBalance: currentBalance,
                afterBalance: newBalance,
                transactionType,
                description,
                status: TransactionStatus.SUCCESS,
                referenceId
            });
            await transaction.save({ session });
            
            // 提交事务
            await session.commitTransaction();
            session.endSession();
            
            return { wallet, transaction };
        } catch (error) {
            // 回滚事务
            await session.abortTransaction();
            session.endSession();
            console.error(`增加余额失败 ${userId} ${currencyType}:`, error);
            throw error;
        }
    }

    /**
     * 减少余额
     * @param userId 用户ID
     * @param currencyType 货币类型
     * @param amount 减少金额
     * @param transactionType 交易类型
     * @param description 描述
     * @param referenceId 参考ID
     * @returns 更新后的钱包和交易记录
     */
    static async decreaseBalance(
        userId: number,
        currencyType: string,
        amount: number,
        transactionType: TransactionType,
        description = "",
        referenceId = ""
    ): Promise<{ wallet: IWallet; transaction: ITransaction }> {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 验证用户是否存在
            const user = await UserService.getUser(userId);
            if (!user?.data?._id) {
                throw new Error(`用户不存在: ${userId}`);
            }
            
            // 获取钱包
            const wallet = await this.getUserWallet(userId);
            if (!wallet) {
                throw new Error(`钱包不存在: ${userId}`);
            }
            
            // 检查余额是否足够
            const currentBalance = wallet.balances.get(currencyType) || 0;
            if (currentBalance < amount) {
                throw new Error(`余额不足: ${currentBalance} < ${amount}`);
            }
            
            // 更新钱包余额
            const newBalance = currentBalance - amount;
            wallet.balances.set(currencyType, newBalance);
            await wallet.save({ session });
            
            // 创建交易记录
            const transaction = new Transaction({
                UserObjectId: user.data._id,
                currencyType,
                amount: -amount, // 减少用负数表示
                beforeBalance: currentBalance,
                afterBalance: newBalance,
                transactionType,
                description,
                status: TransactionStatus.SUCCESS,
                referenceId
            });
            await transaction.save({ session });
            
            // 提交事务
            await session.commitTransaction();
            session.endSession();
            
            return { wallet, transaction };
        } catch (error) {
            // 回滚事务
            await session.abortTransaction();
            session.endSession();
            console.error(`减少余额失败 ${userId} ${currencyType}:`, error);
            throw error;
        }
    }

    /**
     * 为所有用户创建钱包
     * @returns 创建的钱包数量
     */
    static async createWalletsForAllUsers(): Promise<number> {
        try {
            // 获取所有用户
            const allUsers = await UserService.getAllUser();
            if (!allUsers || allUsers.length === 0) {
                return 0;
            }
            
            // 提取用户ID
            const userIds: number[] = allUsers
                .filter((user) => user?.userId && typeof user.userId === "number")
                .map((user) => user.userId!);
            
            // 批量创建钱包
            const createdWallets = await this.batchCreateUserWallets(userIds);
            return createdWallets.length;
        } catch (error) {
            console.error("为所有用户创建钱包失败:", error);
            throw error;
        }
    }
}