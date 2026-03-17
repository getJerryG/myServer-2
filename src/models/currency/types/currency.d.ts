import { Document } from "mongoose";

/**
 * 货币类型ID枚举
 */
export enum CurrencyTypeId {
    PLATFORM_COIN = "platform_coin",
    TEAM_COIN = "team_coin",
    MATCH_COIN = "match_coin",
    BET_COIN = "bet_coin",
    POINT = "point"
}

/**
 * 货币状态枚举
 */
export enum CurrencyStatus {
    ENABLED = 1,
    DISABLED = 0
}

/**
 * 钱包类型枚举
 */
export enum WalletType {
    USER = "user",
    PLATFORM = "platform"
}

/**
 * 钱包状态枚举
 */
export enum WalletStatus {
    NORMAL = 1,
    FROZEN = 0
}

/**
 * 交易类型枚举
 */
export enum TransactionType {
    RECHARGE = "recharge", // 充值
    WITHDRAW = "withdraw", // 提现
    CONSUMPTION = "consumption", // 消费
    REWARD = "reward", // 奖励
    EXCHANGE = "exchange", // 兑换
    TRANSFER = "transfer", // 转账
}

/**
 * 交易状态枚举
 */
export enum TransactionStatus {
    SUCCESS = 1,
    FAILURE = 0,
    PROCESSING = 2
}

/**
 * 补充状态枚举
 */
export enum ReplenishStatus {
    IDLE = "idle", // 空闲
    PENDING = "pending", // 待补充
    PROCESSING = "processing", // 处理中
}

/**
 * 货币类型接口
 */
export interface ICurrencyType {
    id: string;
    name: string;
    symbol: string;
    decimal: number;
    description: string;
    status: CurrencyStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 钱包接口
 */
export interface IWallet extends Document {
    user: string;
    type: WalletType;
    balances: Map<string, number>;
    status: WalletStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 交易记录接口
 */
export interface ITransaction extends Document {
    user: string;
    currencyType: string;
    amount: number;
    beforeBalance: number;
    afterBalance: number;
    transactionType: TransactionType;
    description: string;
    status: TransactionStatus;
    referenceId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 平台钱包接口
 */
export interface IPlatformWallet extends Document {
    currencyType: string;
    balance: number;
    autoReplenish: boolean;
    replenishThreshold: number;
    replenishAmount: number;
    lastReplenishAt: Date | null;
    replenishStatus: ReplenishStatus;
    nextReplenishAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}