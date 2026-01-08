/**
 * Mongoose模型选项配置
 */

import { SchemaOptions } from "mongoose";

/**
 * 默认模型选项
 */
const option: SchemaOptions = {
    // 启用时间戳
    timestamps: {
        createdAt: "createTime",
        updatedAt: "updateTime",
    },
    // 自定义当前时间
    currentTime: () => Date.now(),
    // 隐藏版本号
    versionKey: false,
    // 自定义JSON转换
    toJSON: {
        transform: (_doc, _ret, ret) => {
            delete ret._id;
            return ret;
        }
    }
};

export default option;