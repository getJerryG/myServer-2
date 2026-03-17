import { v4 as uuid } from "uuid";
import ThreadPool from "@/core/ThreadPool";

/**
 * 单个投注信息类
 * 管理单个玩家的投注详情
 */
export class BetScore {
    id: string;
    from: string;
    betScore: number;
    reward: number;
    private _isWin: boolean;
    betType: 0 | 1;

    constructor(readonly openId: string, readonly betAmount: number, betType: 0 | 1) {
        this.id = uuid();
        this.from = openId;
        this.betScore = betAmount;
        this.reward = 0;
        this._isWin = true;
        this.betType = betType;
    }

    /**
     * 获取最终结果（投注金额+奖励）
     */
    result(): number {
        return this.betScore + this.reward;
    }

    /**
     * 获取是否赢
     */
    isWin(): boolean {
        return this._isWin;
    }

    /**
     * 设置为赢
     */
    win(): void {
        this._isWin = true;
        this.reward = this.betScore;
    }

    /**
     * 设置为输
     */
    lose(): void {
        this._isWin = false;
        this.reward = -this.betScore;
    }
}

/**
 * 房间投注选项接口
 */
export interface RoomBetOptions {
    betCustomization?: boolean | Record<string, unknown>;
    [key: string]: unknown; // 替换any为unknown，更安全的类型
}

/**
 * 房间投注管理类
 * 管理房间内所有玩家的投注信息
 */
export default class RoomBetScore {
    private _bets: Map<string, BetScore>;
    private id: string;
    status: 0 | 1 | 2;
    private isWin: boolean;
    readonly options?: RoomBetOptions;

    constructor(options?: RoomBetOptions) {
        this._bets = new Map<string, BetScore>();
        this.id = uuid();
        this.status = 0; // 0: 未开始, 1: 进行中, 2: 已结束
        this.isWin = false;
        this.options = options;
    }

    /**
     * 获取总投注金额
     */
    sumBetScore(): number {
        if (this._bets.size === 0) {
            return 0;
        }

        let sum = 0;
        this._bets.forEach((bet) => {
            sum += bet.betScore;
        });
        return sum;
    }

    /**
     * 获取投注自定义配置
     */
    betCustomization(): boolean | Record<string, unknown> | undefined {
        return this.options?.betCustomization;
    }

    /**
     * 开始投注
     */
    start(): void {
        if (this.status === 2) {
            throw new Error("投注已结束");
        }

        if (this.status === 1) {
            throw new Error("投注已开始");
        }

        this.status = 1;
    }

    /**
     * 玩家投注
     * @param user 用户信息
     * @param betScore 投注金额
     * @param betType 投注类型
     */
    bet(user: { openId: string }, betScore: number, betType: 0 | 1): void {
        if (this.status === 0) {
            throw new Error("投注未开始");
        }

        if (this.status === 2) {
            throw new Error("投注已结束");
        }

        // 如果有投注自定义配置，默认使用类型1
        if (this.betCustomization()) {
            betType = 1;
        }

        const bet = new BetScore(this.id, betScore, betType);
        this._bets.set(user.openId, bet);
    }

    /**
     * 结束投注
     */
    end(): void {
        if (this.status === 0) {
            throw new Error("投注未开始");
        }

        this.status = 2;
    }

    /**
     * 获取等级总和
     */
    get levelSum(): number {
        return Math.floor(this.sumBetScore() / 10);
    }

    /**
     * 获取所有投注
     */
    get bets(): BetScore[] {
        return Array.from(this._bets.values());
    }

    /**
     * 设置为赢
     */
    win(): void {
        this.isWin = true;
        this.__processingData__();
    }

    /**
     * 设置为输
     */
    lose(): void {
        this.isWin = false;
        this.__processingData__();
    }

    /**
     * 处理投注数据
     */
    private __processingData__(): void {
        const pool = ThreadPool.getInstance(6);
        const batchSize = 1000;
        const totalBets = this.bets.length;

        // 分批处理投注数据
        for (let i = 0; i < totalBets; i += batchSize) {
            const batch = this.bets.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (betScore) => {
                if (this.isWin) {
                    betScore.win();
                } else {
                    betScore.lose();
                }

                try {
                    // 计算奖励比例
                    const reward = await pool.addTask((data: number[]) => {
                        const proportion = data[0] / data[1];
                        return Math.max(0, Math.floor(data[2] * proportion));
                    }, [betScore.betScore, this.sumBetScore(), this.betScore || 0]);

                    betScore.reward = betScore.betScore + reward;
                    return reward;
                } catch (e) {
                    console.error("处理投注数据失败:", e);
                    return 0;
                }
            });

            // 等待批次处理完成
            Promise.all(batchPromises).then(() => {
                // 批次处理完成，不需要累加奖励总和
            });
        }
    }

    /**
     * 获取赢的投注
     */
    get winBets(): BetScore[] {
        return Array.from(this._bets.values()).filter((bet) => bet.isWin());
    }

    /**
     * 获取输的投注
     */
    get loseBets(): BetScore[] {
        return Array.from(this._bets.values()).filter((bet) => !bet.isWin());
    }
}