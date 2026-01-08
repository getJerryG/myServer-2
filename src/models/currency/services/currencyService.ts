import CurrencyType from "../data/currencyType";
import { ICurrencyType, CurrencyStatus, CurrencyTypeId } from "../types/currency";

/**
 * 货币类型服务类
 */
export default class CurrencyService {
    /**
     * 创建货币类型
     * @param currencyData 货币类型数据
     * @returns 创建的货币类型
     */
    static async createCurrencyType(currencyData: Partial<ICurrencyType>): Promise<ICurrencyType> {
        try {
            const currencyType = new CurrencyType(currencyData);
            return await currencyType.save();
        } catch (error) {
            console.error("创建货币类型失败:", error);
            throw error;
        }
    }

    /**
     * 获取所有货币类型
     * @returns 货币类型列表
     */
    static async getAllCurrencyTypes(): Promise<ICurrencyType[]> {
        try {
            return await CurrencyType.find().sort({ createdAt: 1 });
        } catch (error) {
            console.error("获取所有货币类型失败:", error);
            throw error;
        }
    }

    /**
     * 根据ID获取货币类型
     * @param id 货币类型ID
     * @returns 货币类型或null
     */
    static async getCurrencyTypeById(id: string): Promise<ICurrencyType | null> {
        try {
            return await CurrencyType.findOne({ id });
        } catch (error) {
            console.error(`根据ID ${id} 获取货币类型失败:`, error);
            throw error;
        }
    }

    /**
     * 更新货币类型
     * @param id 货币类型ID
     * @param currencyData 更新数据
     * @returns 更新后的货币类型或null
     */
    static async updateCurrencyType(id: string, currencyData: Partial<ICurrencyType>): Promise<ICurrencyType | null> {
        try {
            return await CurrencyType.findOneAndUpdate({ id }, currencyData, { new: true });
        } catch (error) {
            console.error(`更新货币类型 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 删除货币类型
     * @param id 货币类型ID
     * @returns 是否删除成功
     */
    static async deleteCurrencyType(id: string): Promise<boolean> {
        try {
            const result = await CurrencyType.deleteOne({ id });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`删除货币类型 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 启用货币类型
     * @param id 货币类型ID
     * @returns 更新后的货币类型或null
     */
    static async enableCurrencyType(id: string): Promise<ICurrencyType | null> {
        try {
            return await this.updateCurrencyType(id, { status: CurrencyStatus.ENABLED });
        } catch (error) {
            console.error(`启用货币类型 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 禁用货币类型
     * @param id 货币类型ID
     * @returns 更新后的货币类型或null
     */
    static async disableCurrencyType(id: string): Promise<ICurrencyType | null> {
        try {
            return await this.updateCurrencyType(id, { status: CurrencyStatus.DISABLED });
        } catch (error) {
            console.error(`禁用货币类型 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 初始化默认货币类型
     * @returns 创建的货币类型列表
     */
    static async initDefaultCurrencyTypes(): Promise<ICurrencyType[]> {
        try {
            const defaultCurrencies = [
                {
                    id: CurrencyTypeId.PLATFORM_COIN,
                    name: "平台币",
                    symbol: "PC",
                    decimal: 0,
                    description: "平台通用货币"
                },
                {
                    id: CurrencyTypeId.TEAM_COIN,
                    name: "团队币",
                    symbol: "TC",
                    decimal: 0,
                    description: "团队活动货币"
                },
                {
                    id: CurrencyTypeId.MATCH_COIN,
                    name: "比赛币",
                    symbol: "MC",
                    decimal: 0,
                    description: "比赛专用货币"
                },
                {
                    id: CurrencyTypeId.BET_COIN,
                    name: "投注币",
                    symbol: "BC",
                    decimal: 0,
                    description: "投注专用货币"
                },
                {
                    id: CurrencyTypeId.POINT,
                    name: "积分",
                    symbol: "P",
                    decimal: 0,
                    description: "用户积分"
                }
            ];

            const createdCurrencies: ICurrencyType[] = [];

            for (const currencyData of defaultCurrencies) {
                const existingCurrency = await this.getCurrencyTypeById(currencyData.id);
                if (!existingCurrency) {
                    const createdCurrency = await this.createCurrencyType(currencyData);
                    createdCurrencies.push(createdCurrency);
                }
            }

            return createdCurrencies;
        } catch (error) {
            console.error("初始化默认货币类型失败:", error);
            throw error;
        }
    }
}