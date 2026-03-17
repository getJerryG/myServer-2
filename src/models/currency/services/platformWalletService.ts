import PlatformWallet from "../data/platformWallet";
import CurrencyType from "../data/currencyType";
import { IPlatformWallet, ReplenishStatus } from "../types/currency";
import mongoose from "mongoose";

/**
 * 平台钱包服务类
 */
export default class PlatformWalletService {
    /**
     * 初始化平台钱包
     * @returns 创建的平台钱包列表
     */
    static async initPlatformWallets(): Promise<IPlatformWallet[]> {
        try {
            const currencyTypes = await CurrencyType.find();
            if (currencyTypes.length === 0) {
                return [];
            }

            const existingWallets = await PlatformWallet.find();
            const existingCurrencyTypes = new Set(existingWallets.map((wallet) => wallet.currencyType));

            const walletsToCreate = currencyTypes
                .filter((type) => !existingCurrencyTypes.has(type.id))
                .map((type) => ({
                    currencyType: type.id,
                    balance: 0, // 初始余额为0
                    autoReplenish: true,
                    replenishThreshold: 1000, // 自动补充阈值为1000
                    replenishAmount: 1000, // 每次补充1000
                    lastReplenishAt: null, // 最后补充时间
                }));

            if (walletsToCreate.length === 0) {
                return existingWallets;
            }

            const createdWallets = await PlatformWallet.insertMany(walletsToCreate);
            return [...existingWallets, ...createdWallets];
        } catch (error) {
            console.error("初始化平台钱包失败:", error);
            throw error;
        }
    }

    /**
     * 根据货币类型获取平台钱包
     * @param currencyType 货币类型
     * @param session MongoDB会话
     * @returns 平台钱包或null
     */
    static async getPlatformWallet(
        currencyType: string,
        session?: mongoose.ClientSession
    ): Promise<IPlatformWallet | null> {
        try {
            return await PlatformWallet.findOne({ currencyType }).session(session);
        } catch (error) {
            console.error(`获取平台钱包 ${currencyType} 失败:`, error);
            throw error;
        }
    }

    /**
     * 获取所有平台钱包
     * @returns 平台钱包列表
     */
    static async getAllPlatformWallets(): Promise<IPlatformWallet[]> {
        try {
            return await PlatformWallet.find();
        } catch (error) {
            console.error("获取所有平台钱包失败:", error);
            throw error;
        }
    }

    /**
     * 更新平台钱包余额
     * @param currencyType 货币类型
     * @param amount 金额
     * @param session MongoDB会话
     * @returns 更新后的平台钱包或null
     */
    static async updatePlatformWalletBalance(
        currencyType: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<IPlatformWallet | null> {
        try {
            const wallet = await this.getPlatformWallet(currencyType, session);
            if (!wallet) {
                throw new Error(`平台钱包 ${currencyType} 不存在`);
            }

            wallet.balance += amount;
            await wallet.save({ session });
            return wallet;
        } catch (error) {
            console.error(`更新平台钱包 ${currencyType} 余额失败:`, error);
            throw error;
        }
    }

    /**
     * 补充平台钱包
     * @param wallet 平台钱包
     * @returns 补充后的平台钱包
     */
    static async replenishPlatformWallet(wallet: IPlatformWallet): Promise<IPlatformWallet> {
        try {
            if (wallet.replenishStatus === ReplenishStatus.PENDING) {
                return wallet;
            }

            if (wallet.balance > wallet.replenishThreshold) {
                return wallet;
            }

            // 设置为处理中状态
            wallet.replenishStatus = ReplenishStatus.PROCESSING;
            await wallet.save();

            // 补充余额
            wallet.balance += wallet.replenishAmount;
            wallet.lastReplenishAt = new Date();

            // 设置为空闲状态
            wallet.replenishStatus = ReplenishStatus.IDLE;
            wallet.nextReplenishAt = null;
            
            await wallet.save();
            console.log(`平台钱包 ${wallet.currencyType} 补充成功，当前余额: ${wallet.balance}`);
            
            return wallet;
        } catch (error) {
            console.error(`补充平台钱包 ${wallet.currencyType} 失败:`, error);
            // 设置为待补充状态
            wallet.replenishStatus = ReplenishStatus.PENDING;
            await wallet.save();
            throw error;
        }
    }

    /**
     * 手动补充所有平台钱包
     * @returns 补充后的平台钱包列表
     */
    static async manuallyReplenishAllPlatformWallets(): Promise<IPlatformWallet[]> {
        try {
            const wallets = await this.getAllPlatformWallets();
            const replenishedWallets = await Promise.all(
                wallets.map((wallet) => this.replenishPlatformWallet(wallet))
            );
            return replenishedWallets;
        } catch (error) {
            console.error("手动补充所有平台钱包失败:", error);
            throw error;
        }
    }

    /**
     * 更新自动补充设置
     * @param currencyType 货币类型
     * @param autoReplenish 是否自动补充
     * @returns 更新后的平台钱包或null
     */
    static async updateAutoReplenishSetting(
        currencyType: string,
        autoReplenish: boolean
    ): Promise<IPlatformWallet | null> {
        try {
            return await PlatformWallet.findOneAndUpdate(
                { currencyType },
                { autoReplenish },
                { new: true }
            );
        } catch (error) {
            console.error(`更新平台钱包 ${currencyType} 自动补充设置失败:`, error);
            throw error;
        }
    }

    /**
     * 获取平台总余额
     * @returns 各货币类型的总余额
     */
    static async getTotalPlatformBalance(): Promise<Record<string, number>> {
        try {
            const wallets = await this.getAllPlatformWallets();
            const totalBalance: Record<string, number> = {};
            
            wallets.forEach((wallet) => {
                totalBalance[wallet.currencyType] = wallet.balance;
            });
            
            return totalBalance;
        } catch (error) {
            console.error("获取平台总余额失败:", error);
            throw error;
        }
    }
}