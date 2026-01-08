import { Schema, model, Document, Model } from "mongoose";

// 红包包接口定义
export interface IRedBagbag extends Document {
    redBagId: Schema.Types.ObjectId; // 红包ID
    amount: number; // 金额
    status: 0 | 1 | 2; // 状态：0-未领取, 1-已领取, 2-已过期
}

// 红包包Schema定义
const redBagbagSchema = new Schema<IRedBagbag>({
    redBagId: {
        type: Schema.Types.ObjectId,
        ref: "RedBag",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// 红包包模型
const RedBagbag: Model<IRedBagbag> = model<IRedBagbag>("RedBagbag", redBagbagSchema);

export default RedBagbag;