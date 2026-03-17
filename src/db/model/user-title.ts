import { Schema, model, Document } from "mongoose";

// 用户标题接口定义
export interface IUserTitle extends Document {
    title: Schema.Types.ObjectId; // 标题ID
    userId: Schema.Types.ObjectId; // 用户ID
}

// 用户标题Schema定义
const UserTitleSchema = new Schema<IUserTitle>({
    title: {
        type: Schema.Types.ObjectId,
        ref: "titles", // 关联标题表
        required: true // 必须字段
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users", // 关联用户表
        required: true // 必须字段
    }
});

// 创建联合唯一索引，确保一个用户不会重复拥有同一个标题
UserTitleSchema.index({ title: 1, userId: 1 }, { unique: true });

// 用户标题模型
const UserTitleModel = model<IUserTitle>("UserTitle", UserTitleSchema);

export default UserTitleModel;