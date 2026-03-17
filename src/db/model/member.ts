import { Schema, Document, model } from "mongoose";

// 成员类型枚举
export enum MemberType {
    NORMAL = 0, // 普通成员
    VIP = 1, // VIP成员
    SVIP = 2, // 超级VIP
    ADMIN = 3, // 管理员
    SUPERVISOR = 4, // 监事
    OWNER = 5 // 所有者
}

// 成员接口定义
export interface IMember extends Document {
    startTime: Date; // 开始时间
    endTime: Date; // 结束时间
    status: 0 | 1 | 2; // 状态：0-待激活, 1-活跃, 2-已过期
    type: MemberType; // 成员类型
    user: Schema.Types.ObjectId; // 用户ID
    exp: number; // 经验值
}

// 成员Schema定义
const memberSchema = new Schema<IMember>({
    startTime: {
        type: Date,
        required: false,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: false,
        default: Date.now
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        required: false,
        default: 0
    },
    type: {
        type: Number,
        enum: Object.values(MemberType),
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false,
        default: null
    },
    exp: {
        type: Number,
        required: false,
        default: 0
    }
}, {
    timestamps: true, // 自动生成createdAt和updatedAt字段
    versionKey: false, // 不生成_v字段
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// 创建索引
memberSchema.index({ user: 1 }, { unique: true }); // 用户ID唯一索引
memberSchema.index({ startTime: 1, endTime: 1 }); // 时间范围索引
memberSchema.index({ status: 1 }); // 状态索引
memberSchema.index({ type: 1 }); // 类型索引
memberSchema.index({ exp: 1 }); // 经验值索引

/**
 * 成员保存前的中间件
 */
function memberPre(next: () => void) {
    const now = new Date();
    
    // 检查成员状态
    if (this.endTime && now > this.endTime) {
        this.status = 2; // 已过期
    } else {
        this.status = 1; // 活跃
    }
    
    next();
}

// 应用中间件
memberSchema.pre("save", memberPre);
memberSchema.post("updateOne", memberPre);
memberSchema.post("findOneAndUpdate", memberPre);

// 模型定义
export const MemberModel = model<IMember>("Member", memberSchema);

export default MemberModel;