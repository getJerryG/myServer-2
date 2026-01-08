/**
 * 基础物品接口
 */
export interface BaseItem {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    stock: number;
    createTime: Date;
    updateTime: Date;
}

/**
 * 物品选项接口
 */
export interface ItemOptions {
    isBind?: boolean;
    duration?: number;
    attributes?: Record<string, any>;
}

/**
 * 物品接口，继承基础物品接口并添加选项
 */
export interface Item extends BaseItem {
    options?: ItemOptions;
}
