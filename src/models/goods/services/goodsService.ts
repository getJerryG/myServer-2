import GoodsModel from "../../../db/model/goods";
import {
    Goods,
    GoodsCreateRequest,
    GoodsUpdateRequest,
    GoodsStatusUpdateRequest,
    GoodsStockUpdateRequest,
    GoodsPriceUpdateRequest,
    GoodsBuyRequest,
    GoodsBuyResponse,
    GoodsStatus
} from "../../../../types/goods";
import { TransactionType } from "../../currency/types/currency";
import WalletService from "../../currency/services/walletService";
import mongoose from "mongoose";

export default class GoodsService {
    /**
     * 获取商品列表
     * @param query 查询条件
     * @param page 页码
     * @param pageSize 每页数量
     * @returns 商品列表和分页信息
     */
    static async getGoodsList(
        query: any = {},
        page = 1,
        pageSize = 10
    ): Promise<{ goods: Goods[]; total: number; totalPages: number }> {
        try {
            const filter: any = {};
            
            if (query.type) {
                filter.type = query.type;
            }
            
            if (query.status) {
                filter.status = Number(query.status);
            }
            
            if (query.name) {
                filter.name = { $regex: query.name, $options: "i" };
            }

            const total = await GoodsModel.countDocuments(filter);
            const totalPages = Math.ceil(total / pageSize);
            
            const goodsList = await GoodsModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean() as Goods[];

            return {
                goods: goodsList,
                total,
                totalPages
            };
        } catch (error) {
            console.error("获取商品列表失败:", error);
            throw error;
        }
    }

    /**
     * 根据ID获取商品
     * @param id 商品ID
     * @returns 商品信息或null
     */
    static async getGoodsById(id: string): Promise<Goods | null> {
        try {
            const goods = await GoodsModel.findById(id).lean();
            return goods as Goods | null;
        } catch (error) {
            console.error(`根据ID ${id} 获取商品失败:`, error);
            throw error;
        }
    }

    /**
     * 创建商品
     * @param goodsData 商品数据
     * @returns 创建的商品
     */
    static async createGoods(goodsData: GoodsCreateRequest): Promise<Goods> {
        try {
            const goods = await GoodsModel.create({
                ...goodsData,
                status: goodsData.status || GoodsStatus.ON_SHELF
            });
            
            return goods.toJSON() as Goods;
        } catch (error) {
            console.error("创建商品失败:", error);
            throw error;
        }
    }

    /**
     * 更新商品
     * @param id 商品ID
     * @param goodsData 更新数据
     * @returns 更新后的商品或null
     */
    static async updateGoods(id: string, goodsData: GoodsUpdateRequest): Promise<Goods | null> {
        try {
            const goods = await GoodsModel.findByIdAndUpdate(
                id,
                goodsData,
                { new: true, runValidators: true }
            );
            
            return goods ? (goods.toJSON() as Goods) : null;
        } catch (error) {
            console.error(`更新商品 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 删除商品
     * @param id 商品ID
     * @returns 是否删除成功
     */
    static async deleteGoods(id: string): Promise<boolean> {
        try {
            const result = await GoodsModel.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            console.error(`删除商品 ${id} 失败:`, error);
            throw error;
        }
    }

    /**
     * 更新商品状态
     * @param id 商品ID
     * @param statusData 状态数据
     * @returns 更新后的商品或null
     */
    static async updateGoodsStatus(id: string, statusData: GoodsStatusUpdateRequest): Promise<Goods | null> {
        try {
            const goods = await GoodsModel.findByIdAndUpdate(
                id,
                { status: statusData.status },
                { new: true, runValidators: true }
            );
            
            return goods ? (goods.toJSON() as Goods) : null;
        } catch (error) {
            console.error(`更新商品 ${id} 状态失败:`, error);
            throw error;
        }
    }

    /**
     * 更新商品库存
     * @param id 商品ID
     * @param stockData 库存数据
     * @returns 更新后的商品或null
     */
    static async updateGoodsStock(id: string, stockData: GoodsStockUpdateRequest): Promise<Goods | null> {
        try {
            const goods = await GoodsModel.findByIdAndUpdate(
                id,
                { stock: stockData.stock },
                { new: true, runValidators: true }
            );
            
            return goods ? (goods.toJSON() as Goods) : null;
        } catch (error) {
            console.error(`更新商品 ${id} 库存失败:`, error);
            throw error;
        }
    }

    /**
     * 更新商品价格
     * @param id 商品ID
     * @param priceData 价格数据
     * @returns 更新后的商品或null
     */
    static async updateGoodsPrice(id: string, priceData: GoodsPriceUpdateRequest): Promise<Goods | null> {
        try {
            const goods = await GoodsModel.findByIdAndUpdate(
                id,
                { [`prices.${priceData.currencyType}`]: priceData.price },
                { new: true, runValidators: true }
            );
            
            return goods ? (goods.toJSON() as Goods) : null;
        } catch (error) {
            console.error(`更新商品 ${id} 价格失败:`, error);
            throw error;
        }
    }

    /**
     * 购买商品
     * @param userId 用户ID
     * @param goodsId 商品ID
     * @param buyData 购买数据
     * @returns 购买结果
     */
    static async buyGoods(userId: number, goodsId: string, buyData: GoodsBuyRequest): Promise<GoodsBuyResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const goods = await GoodsModel.findById(goodsId).session(session);
            if (!goods) {
                throw new Error("商品不存在");
            }
            
            if (goods.status !== GoodsStatus.ON_SHELF) {
                throw new Error("商品已下架");
            }
            
            const quantity = buyData.quantity || 1;
            if (goods.stock < quantity) {
                throw new Error("商品库存不足");
            }
            
            const price = goods.prices.get(buyData.currencyType);
            if (!price) {
                throw new Error(`商品不支持 ${buyData.currencyType} 支付`);
            }
            
            const totalAmount = price * quantity;

            // 扣除用户余额
            const { wallet, transaction } = await WalletService.decreaseBalance(
                userId,
                buyData.currencyType,
                totalAmount,
                TransactionType.CONSUMPTION,
                `购买商品: ${goods.name} x ${quantity}`,
                goodsId,
                session
            );
            
            // 更新商品库存
            goods.stock -= quantity;
            await goods.save({ session });
            
            // 提交事务
            await session.commitTransaction();
            session.endSession();
            
            return {
                transactionId: transaction._id.toString(),
                goodsId: goods._id.toString(),
                quantity,
                currencyType: buyData.currencyType,
                amount: totalAmount,
                remainingBalance: wallet.balances.get(buyData.currencyType) || 0
            };
        } catch (error) {
            // 回滚事务
            await session.abortTransaction();
            session.endSession();
            
            console.error(`用户 ${userId} 购买商品 ${goodsId} 失败:`, error);
            throw error;
        }
    }
}