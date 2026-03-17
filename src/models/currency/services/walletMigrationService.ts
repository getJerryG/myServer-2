import UserService from "@/models/User/services/userService";
import WalletService from "./walletService";
import CurrencyService from "./currencyService";
import PlatformWalletService from "./platformWalletService";

/**
 * 钱包迁移服务类
 */
export default class WalletMigrationService {
    /**
     * 获取所有用户ID
     * @returns 用户ID列表
     */
    static async getAllUserIds(): Promise<number[]> {
        try {
            const users = await UserService.getAllUser();
            return users.map((user) => user.userId!);
        } catch (error) {
            console.error("获取用户ID失败:", error);
            throw error;
        }
    }

    /**
     * 为所有用户创建钱包
     * @returns 创建的钱包数量
     */
    static async createWalletsForAllUsers(): Promise<number> {
        try {
            const userIds = await this.getAllUserIds();
            if (userIds.length === 0) {
                return 0;
            }

            const createdWallets = await WalletService.batchCreateUserWallets(userIds);
            return createdWallets.length;
        } catch (error) {
            console.error("为所有用户创建钱包失败:", error);
            throw error;
        }
    }

    /**
     * 初始化货币系统
     * 1. 初始化默认货币类型
     * 2. 初始化平台钱包
     * 3. 为所有用户创建钱包
     * @returns 初始化结果
     */
    static async initCurrencySystem(): Promise<{
        currencyCount: number;
        platformWalletCount: number;
        userWalletCount: number;
    }> {
        try {
            // 1. 初始化默认货币类型
            const currencies = await CurrencyService.initDefaultCurrencyTypes();
            const currencyCount = currencies.length;

            // 2. 初始化平台钱包
            const platformWallets = await PlatformWalletService.initPlatformWallets();
            const platformWalletCount = platformWallets.length;

            // 3. 为所有用户创建钱包
            const userWalletCount = await this.createWalletsForAllUsers();

            return {
                currencyCount,
                platformWalletCount,
                userWalletCount
            };
        } catch (error) {
            console.error("初始化货币系统失败:", error);
            throw error;
        }
    }
}