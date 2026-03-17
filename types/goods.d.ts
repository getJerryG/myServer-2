// 商品类型枚举
export enum GoodsType {
    EXPERIENCE = "experience", // 经验
    MATCH = "match", // 比赛
    RENAME = "rename", // 改名
    CARD = "card", // 卡牌
    COSTUME = "costume", // 装扮
    FRAME = "frame", // 头像框
    BADGE = "badge", // 徽章
    EMOTICON = "emoticon", // 表情
    VOICE = "voice", // 语音
    BACKGROUND = "background" // 背景
}

// 商品状态枚举
export enum GoodsStatus {
    ON_SHELF = 1, // 上架
    OFF_SHELF = 0 // 下架
}

// 商品接口
export interface Goods {
    _id: string;
    goodsId: number;
    name: string;
    type: GoodsType;
    description: string;
    prices: Map<string, number>;
    stock: number;
    status: GoodsStatus;
    createdAt: Date;
    updatedAt: Date;
}

// 创建商品请求
export interface GoodsCreateRequest {
    name: string;
    type: GoodsType;
    description: string;
    prices: Map<string, number>;
    stock: number;
    status?: GoodsStatus;
}

// 更新商品请求
export interface GoodsUpdateRequest {
    name?: string;
    description?: string;
    prices?: Map<string, number>;
    stock?: number;
    status?: GoodsStatus;
}

// 更新商品状态请求
export interface GoodsStatusUpdateRequest {
    status: GoodsStatus;
}

// 更新商品库存请求
export interface GoodsStockUpdateRequest {
    stock: number;
}

// 更新商品价格请求
export interface GoodsPriceUpdateRequest {
    currencyType: string;
    price: number;
}

// 购买商品请求
export interface GoodsBuyRequest {
    goodsId: number;
    quantity?: number;
    currencyType: string;
}

// 购买商品响应
export interface GoodsBuyResponse {
    transactionId: string;
    goodsId: string;
    quantity: number;
    currencyType: string;
    amount: number;
    remainingBalance: number;
}
