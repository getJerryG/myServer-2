import { Schema, model, Document } from "mongoose";

export interface WelfareCode extends Document {
    code: string; // 福利码
    type: 0 | 1 | 2; // 类型：0, 1, 2
    status: 0 | 1 | 2 | 3 | 4; // 状态：0: 未激活, 1: 已激活, 2: 已过期, 3: 已禁用, 4: 已用完
    endTime: Date; // 结束时间，默认24小时
    usedCount: number; // 已使用次数
    maxUsedByOthers: number; // 最大使用次数
    exclusive: Schema.Types.ObjectId | null; // 专属用户ID
}

const WelfareCodeSchema = new Schema<WelfareCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true, // 唯一索引
        },
        type: {
            type: Number,
            required: true,
            enum: [0, 1, 2], // 0: 类型1, 1: 类型2, 2: 类型3
            default: 0,
        },
        status: {
            type: Number,
            required: true,
            enum: [0, 1, 2, 3, 4], // 0: 未激活, 1: 已激活, 2: 已过期, 3: 已禁用, 4: 已用完
            default: 0,
        },
        endTime: {
            type: Date,
            required: false,
            default: () => new Date(Date.now() + 1000 * 60 * 60 * 24), // 默认24小时后过期
        },
        usedCount: {
            type: Number,
            required: false,
            default: 0, // 已使用次数
        },
        maxUsedByOthers: {
            type: Number,
            required: false,
            default: 3, // 最大使用次数
        },
        exclusive: {
            type: Schema.Types.ObjectId, // 专属用户ID
            ref: "Users",
            required: false,
            default: null,
        },
    },
    {
        timestamps: true, // 自动添加createdAt和updatedAt字段
        versionKey: false, // 不添加__v字段
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            },
        },
    }
);

WelfareCodeSchema.index({ code: 1, type: 1, status: 1, exclusive: 1 }, { unique: true });

export default model<WelfareCode>("WelfareCode", WelfareCodeSchema);
