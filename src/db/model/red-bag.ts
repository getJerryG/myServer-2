import { Schema, model, Document, Model } from "mongoose";
import data from "@/data/items";

type TItem = keyof typeof data;

interface IRedBag extends Document {
    redBagId: string; // ID
    name: string; // 红包名称
    totalAmount: number; // 总金额
    totalCount: number; // 总数量
    createdAt: Date; // 创建时间
    updatedAt: Date; // 更新时间
    item: TItem; // 物品类型
    issuer: Schema.Types.ObjectId; // 发放者ID
}

const redBagSchema = new Schema<IRedBag>({
    redBagId: { type: String, required: true }, // ID
    name: { type: String, required: true }, // 红包名称
    totalAmount: { type: Number, required: true }, // 总金额
    totalCount: { type: Number, required: true }, // 总数量
    createdAt: { type: Date, default: Date.now }, // 创建时间
    updatedAt: { type: Date, default: Date.now }, // 更新时间
    item: { type: String, required: true }, // 物品类型
    issuer: { type: Schema.Types.ObjectId, ref: "Users", required: false } // 发放者ID
});

const RedBag: Model<IRedBag> = model<IRedBag>("RedBag", redBagSchema);

export default RedBag;
export type { IRedBag };
