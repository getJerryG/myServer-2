import express, { Request, Response } from "express";
import { resSuccess, resCreated, resError, resNotFound, resBadRequest } from "../utils/res";
import GoodsService from "../models/goods/services/GoodsService";
import { Admin } from "../middlewares/role";
import { GoodsBuyRequest } from "../../types/goods";

const router = express.Router();

// ------------------------------ 商品管理 ------------------------------

/**
 * 获取商品列表
 */
router.get("/goods", Admin, async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10, ...query } = req.query;
        const result = await GoodsService.getGoodsList(
            query,
            parseInt(page as string),
            parseInt(pageSize as string)
        );
        resSuccess(res, result, "获取商品列表成功");
    } catch (error) {
        console.error("获取商品列表失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取商品列表失败");
    }
});

/**
 * 获取商品详情
 */
router.get("/goods/:id", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const goods = await GoodsService.getGoodsById(id);
        if (!goods) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, goods, "获取商品详情成功");
    } catch (error) {
        console.error("获取商品详情失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "获取商品详情失败");
    }
});

/**
 * 创建商品
 */
router.post("/goods", Admin, async (req: Request, res: Response) => {
    try {
        const goodsData = req.body;
        const goods = await GoodsService.createGoods(goodsData);
        resCreated(res, goods, "创建商品成功");
    } catch (error) {
        console.error("创建商品失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "创建商品失败");
    }
});

/**
 * 更新商品
 */
router.put("/goods/:id", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const goodsData = req.body;
        const goods = await GoodsService.updateGoods(id, goodsData);
        if (!goods) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, goods, "更新商品成功");
    } catch (error) {
        console.error("更新商品失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新商品失败");
    }
});

/**
 * 删除商品
 */
router.delete("/goods/:id", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await GoodsService.deleteGoods(id);
        if (!result) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, null, "删除商品成功");
    } catch (error) {
        console.error("删除商品失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "删除商品失败");
    }
});

/**
 * 更新商品状态
 */
router.put("/goods/:id/status", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const statusData = req.body;
        const goods = await GoodsService.updateGoodsStatus(id, statusData);
        if (!goods) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, goods, "更新商品状态成功");
    } catch (error) {
        console.error("更新商品状态失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新商品状态失败");
    }
});

/**
 * 更新商品库存
 */
router.put("/goods/:id/stock", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const stockData = req.body;
        const goods = await GoodsService.updateGoodsStock(id, stockData);
        if (!goods) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, goods, "更新商品库存成功");
    } catch (error) {
        console.error("更新商品库存失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新商品库存失败");
    }
});

/**
 * 更新商品价格
 */
router.put("/goods/:id/price", Admin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const priceData = req.body;
        const goods = await GoodsService.updateGoodsPrice(id, priceData);
        if (!goods) {
            return resNotFound(res, "商品不存在");
        }
        resSuccess(res, goods, "更新商品价格成功");
    } catch (error) {
        console.error("更新商品价格失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "更新商品价格失败");
    }
});

// ------------------------------ 商品购买 ------------------------------

/**
 * 购买商品
 */
router.post("/goods/:id/buy", async (req: Request, res: Response) => {
    try {
        const { id: goodsId } = req.params;
        const buyData: GoodsBuyRequest = req.body;
        const userId = Number(req.body.userId);
        
        if (!userId) {
            return resBadRequest(res, "缺少用户ID");
        }
        
        const result = await GoodsService.buyGoods(userId, goodsId, buyData);
        resSuccess(res, result, "购买商品成功");
    } catch (error) {
        console.error("购买商品失败:", error);
        resError(res, 500, error instanceof Error ? error.message : "购买商品失败");
    }
});

export default router;