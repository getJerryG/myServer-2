import express, { Request, Response } from "express";
import CurrencyService from "../models/currency/services/currencyService";
import WalletService from "../models/currency/services/walletService";
import TransactionService from "../models/currency/services/transactionService";
import PlatformWalletService from "../models/currency/services/platformWalletService";
import UserService from "../models/User/services/userService";
import { CurrencyStatus, WalletStatus, TransactionType, TransactionStatus } from "../models/currency/types/currency";
import auth from "@/middlewares/auth";
import { Admin, SuperAdmin } from "@/middlewares/role";
import { resSuccess, resCreated, resError, resBadRequest, resNotFound } from "../utils/res";

const router = express.Router();

// ------------------------------ 货币管理 ------------------------------

/**
 * 获取所有货币类型
 */
router.get("/currencies", async (req: Request, res: Response) => {
    try {
        const currencies = await CurrencyService.getAllCurrencyTypes();
        resSuccess(res, currencies, "获取货币类型成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取货币类型失败");
    }
});

/**
 * 获取货币类型详情
 */
router.get("/currencies/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currency = await CurrencyService.getCurrencyTypeById(id);
        if (!currency) {
            return resNotFound(res, "货币类型不存在");
        }
        resSuccess(res, currency, "获取货币类型详情成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取货币类型详情失败");
    }
});

/**
 * 创建货币类型
 */
router.post("/currencies", auth, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const currencyData = req.body;
        const currency = await CurrencyService.createCurrencyType(currencyData);
        resCreated(res, currency, "创建货币类型成功");
    } catch (error) {
        console.error("创建货币类型失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "创建货币类型失败");
    }
});

/**
 * 更新货币类型
 */
router.put("/currencies/:id", SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currencyData = req.body;
        const currency = await CurrencyService.updateCurrencyType(id, currencyData);
        if (!currency) {
            return resNotFound(res, "货币类型不存在");
        }
        resSuccess(res, currency, "更新货币类型成功");
    } catch (error) {
        console.error("更新货币类型失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新货币类型失败");
    }
});

/**
 * 删除货币类型
 */
router.delete("/currencies/:id", SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await CurrencyService.deleteCurrencyType(id);
        if (!result) {
            return resNotFound(res, "货币类型不存在");
        }
        resSuccess(res, null, "删除货币类型成功");
    } catch (error) {
        console.error("删除货币类型失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "删除货币类型失败");
    }
});

/**
 * 初始化默认货币类型
 */
router.post("/currencies/init", Admin, async (req: Request, res: Response) => {
    try {
        const result = await CurrencyService.initDefaultCurrencyTypes();
        resSuccess(res, result, "初始化货币类型成功");
    } catch (error) {
        console.error("初始化货币类型失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "初始化货币类型失败");
    }
});

// ------------------------------ 钱包管理 ------------------------------

/**
 * 获取用户钱包余额
 */
router.get("/wallet/user/:userId/balances", SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const numericUserId = Number(userId);
        const balances = await WalletService.getWalletBalances(numericUserId);
        resSuccess(res, { balances }, "获取钱包余额成功");
    } catch (error) {
        console.error("获取钱包余额失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取钱包余额失败");
    }
});

/**
 * 创建用户钱包
 */
router.post("/wallet/user", Admin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const numericUserId = Number(userId);
        const wallet = await WalletService.createUserWallet(numericUserId);
        resSuccess(res, wallet, "创建用户钱包成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "创建用户钱包失败");
    }
});

/**
 * 批量创建用户钱包
 */
router.post("/wallet/user/batch", Admin, async (req: Request, res: Response) => {
    try {
        const { userIds } = req.body;
        const numericUserIds = userIds.map((id: string | number) => Number(id));
        const wallets = await WalletService.batchCreateUserWallets(numericUserIds);
        resSuccess(res, wallets, "批量创建用户钱包成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "批量创建用户钱包失败");
    }
});

/**
 * 更新用户钱包状态
 */
router.put("/wallet/user/:userId/status", Admin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        const numericUserId = Number(userId);
        const wallet = await WalletService.updateWalletStatus(numericUserId, status);
        if (!wallet) {
            return resNotFound(res, "钱包不存在");
        }
        resSuccess(res, wallet, "更新钱包状态成功");
    } catch (error) {
        console.error("更新钱包状态失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新钱包状态失败");
    }
});

/**
 * 充值
 */
router.post("/wallet/recharge", Admin, async (req: Request, res: Response) => {
    try {
        const { userId, currencyType, amount, description } = req.body;
        const numericUserId = Number(userId);
        const numericAmount = Number(amount);
        const result = await WalletService.increaseBalance(
            numericUserId,
            currencyType,
            numericAmount,
            TransactionType.RECHARGE,
            description
        );
        resSuccess(res, {
            balance: result.wallet.balances.get(currencyType) || 0,
            transaction: result.transaction
        }, "充值成功");
    } catch (error) {
        console.error("充值失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "充值失败");
    }
});

/**
 * 扣款
 */
router.post("/wallet/deduct", SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { userId, currencyType, amount, description, referenceId } = req.body;
        const numericUserId = Number(userId);
        const numericAmount = Number(amount);
        const result = await WalletService.decreaseBalance(
            numericUserId,
            currencyType,
            numericAmount,
            TransactionType.CONSUMPTION,
            description,
            referenceId
        );
        resSuccess(res, {
            balance: result.wallet.balances.get(currencyType) || 0,
            transaction: result.transaction
        }, "扣款成功");
    } catch (error) {
        console.error("扣款失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "扣款失败");
    }
});

/**
 * 奖励
 */
router.post("/wallet/reward", Admin, async (req: Request, res: Response) => {
    try {
        const { userId, currencyType, amount, description, referenceId } = req.body;
        const numericUserId = Number(userId);
        const numericAmount = Number(amount);
        const result = await WalletService.increaseBalance(
            numericUserId,
            currencyType,
            numericAmount,
            TransactionType.REWARD,
            description,
            referenceId
        );
        resSuccess(res, {
            balance: result.wallet.balances.get(currencyType) || 0,
            transaction: result.transaction
        }, "奖励成功");
    } catch (error) {
        console.error("奖励失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "奖励失败");
    }
});

// ------------------------------ 交易管理 ------------------------------

/**
 * 获取用户交易记录
 */
router.get("/transactions/user/:userId", auth, Admin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { page = 1, pageSize = 10, startTime, endTime, transactionType, currencyType } = req.query;
        
        const pageNum = parseInt(page as string, 10);
        const size = parseInt(pageSize as string, 10);
        const startDate = startTime ? new Date(startTime as string) : undefined;
        const endDate = endTime ? new Date(endTime as string) : undefined;
        
        const result = await TransactionService.getUserTransactions(
            Number(userId),
            pageNum,
            size,
            startDate,
            endDate,
            transactionType as TransactionType,
            currencyType as string
        );
        
        resSuccess(res, result, "获取交易记录成功");
    } catch (error) {
        console.error("获取交易记录失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取交易记录失败");
    }
});

/**
 * 获取交易详情
 */
router.get("/transactions/:id", auth, Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const transaction = await TransactionService.getTransactionById(Number(id));
        if (!transaction) {
            return resNotFound(res, "交易记录不存在");
        }
        resSuccess(res, transaction, "获取交易详情成功");
    } catch (error) {
        console.error("获取交易详情失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取交易详情失败");
    }
});

/**
 * 导出交易记录
 */
router.get("/transactions/export/:userId", auth, Admin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { startTime, endTime } = req.query;
        
        const startDate = startTime ? new Date(startTime as string) : undefined;
        const endDate = endTime ? new Date(endTime as string) : undefined;
        const transactions = await TransactionService.exportTransactions(Number(userId), startDate, endDate);
        
        resSuccess(res, transactions, "导出交易记录成功");
    } catch (error) {
        console.error("导出交易记录失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "导出交易记录失败");
    }
});

// ------------------------------ 平台钱包 ------------------------------

/**
 * 获取所有平台钱包
 */
router.get("/platform-wallets", auth, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const wallets = await PlatformWalletService.getAllPlatformWallets();
        resSuccess(res, wallets, "获取平台钱包成功");
    } catch (error) {
        console.error("获取平台钱包失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取平台钱包失败");
    }
});

/**
 * 获取平台钱包总余额
 */
router.get("/platform-wallets/total", SuperAdmin, async (req: Request, res: Response) => {
    try {
        const totalBalance = await PlatformWalletService.getTotalPlatformBalance();
        resSuccess(res, totalBalance, "获取平台钱包总余额成功");
    } catch (error) {
        console.error("获取平台钱包总余额失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取平台钱包总余额失败");
    }
});

/**
 * 初始化平台钱包
 */
router.post("/platform-wallets/init", auth, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const result = await PlatformWalletService.initPlatformWallets();
        resSuccess(res, result, "初始化平台钱包成功");
    } catch (error) {
        console.error("初始化平台钱包失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "初始化平台钱包失败");
    }
});

/**
 * 手动补充平台钱包
 */
router.post("/platform-wallets/replenish", auth, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const result = await PlatformWalletService.manuallyReplenishAllPlatformWallets();
        resSuccess(res, result, "补充平台钱包成功");
    } catch (error) {
        console.error("补充平台钱包失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "补充平台钱包失败");
    }
});

/**
 * 更新自动补充设置
 */
router.put("/platform-wallets/:currencyType/auto-replenish", auth, SuperAdmin, async (req: Request, res: Response) => {
    try {
        const { currencyType } = req.params;
        const { autoReplenish } = req.body;
        const wallet = await PlatformWalletService.updateAutoReplenishSetting(currencyType, autoReplenish);
        if (!wallet) {
            return resNotFound(res, "平台钱包不存在");
        }
        resSuccess(res, wallet, "更新自动补充设置成功");
    } catch (error) {
        console.error("更新自动补充设置失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新自动补充设置失败");
    }
});

// ------------------------------ 用户钱包 ------------------------------

/**
 * 获取当前用户钱包
 */
router.get("/user-wallets", auth, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const wallets = await WalletService.getUserWallet(Number(userId));
        if (!wallets) {
            return resNotFound(res, "钱包不存在");
        }
        const balances = Object.fromEntries(wallets.balances);
        resSuccess(res, { balances, userId }, "获取钱包成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取钱包失败");
    }
});

/**
 * 获取当前用户交易记录
 */
router.get("/user-transactions", auth, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        if (!userId) {
            return resBadRequest(res, "缺少用户ID");
        }
        
        const { page = 1, pageSize = 10, startTime, endTime, transactionType, currencyType } = req.query;
        
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        
        if (startTime) {
            startDate = new Date(startTime as string);
            if (isNaN(startDate.getTime())) {
                return resBadRequest(res, "无效的开始时间");
            }
        }
        
        if (endTime) {
            endDate = new Date(endTime as string);
            if (isNaN(endDate.getTime())) {
                return resBadRequest(res, "无效的结束时间");
            }
        }
        
        if (startDate && endDate && startDate > endDate) {
            return resBadRequest(res, "开始时间不能大于结束时间");
        }
        
        let txType: TransactionType | undefined;
        if (transactionType) {
            if (Object.values(TransactionType).includes(transactionType as TransactionType)) {
                txType = transactionType as TransactionType;
            } else {
                return resBadRequest(res, `无效的交易类型: ${Object.values(TransactionType).join(", ")}`);
            }
        }
        
        const validCurrencyType = currencyType ? String(currencyType) : undefined;
        
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const size = Math.max(1, Math.min(100, parseInt(pageSize as string, 10) || 10));
        
        const transactions = await TransactionService.getUserTransactions(
            Number(userId),
            pageNum,
            size,
            startDate,
            endDate,
            txType,
            validCurrencyType
        );
        
        resSuccess(res, transactions, "获取交易记录成功");
    } catch (error) {
        console.error("获取交易记录失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取交易记录失败");
    }
});

/**
 * 获取当前用户交易详情
 */
router.get("/user-transactions/:id", auth, async (req: Request, res: Response) => {
    try {
        const {userId} = req.user;
        const transactionId = req.params.id;
        
        const transaction = await TransactionService.getTransactionById(Number(transactionId));
        if (!transaction) {
            return resNotFound(res, "交易记录不存在");
        }
        
        const user = await UserService.getUser(userId);
        if (!user) {
            return resNotFound(res, "用户不存在");
        }
        
        resSuccess(res, transaction, "获取交易详情成功");
    } catch (error) {
        console.error("获取交易详情失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取交易详情失败");
    }
});

export default router;