import { IRecordItem } from "./types/contest";

/**
 * 游戏记录类
 * 用于管理用户的游戏记录，包括胜场、败场、MVP等数据
 */
export class GameRecord {
    records: IRecordItem[];

    constructor(records: IRecordItem[]) {
        this.records = records;
    }

    /**
     * 获取用户的胜场数
     */
    getWinCount(): number {
        return this.records.filter(record => record.isWin).length;
    }

    /**
     * 获取用户的败场数
     */
    getLoseCount(): number {
        return this.records.filter(record => !record.isWin).length;
    }

    /**
     * 获取用户的MVP次数
     */
    getMvpCount(): number {
        return this.records.filter(record => record.isMvp).length;
    }

    /**
     * 获取用户的胜率
     */
    getWinRate(): number {
        const totalGames = this.records.length;
        if (totalGames === 0) return 0;
        return (this.getWinCount() / totalGames) * 100;
    }

    /**
     * 添加一条游戏记录
     */
    addRecord(record: IRecordItem): void {
        this.records.push(record);
    }

    /**
     * 获取最近的N条记录
     */
    getRecentRecords(count: number): IRecordItem[] {
        return this.records.slice(-count);
    }

    /**
     * 获取总游戏场次
     */
    getTotalGames(): number {
        return this.records.length;
    }
}