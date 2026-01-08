import mongoose, { Schema, Model, Document } from "mongoose";
import option from "../../../db/model/option";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose as any);
import signInSchema from "./signIn";
import { IUser } from "@/types/user";

interface UserDocument extends IUser, Document {
    id: string;
}

const userSchema = new Schema<UserDocument>(
    {
        userId: {
            type: Number,
            required: true,
            unique: true,
            default: 0
        },
        openId: {
            type: String,
            required: true,
            unique: true
        },
        session_key: {
            type: String
        },
        nickname: {
            type: String,
            default: ""
        },
        avatar: {
            type: String,
            default: ""
        },
        status: {
            type: Number,
            default: 0
        },
        role: {
            type: Number,
            default: 0
        },
        user_title: {
            type: Array,
            default: []
        },
        sex: {
            type: Number,
            default: 0
        },
        permission: {
            type: Number,
            default: 0
        }
    },
    {
        ...option,
        discriminatorKey: "kind",
    }
);

// 添加自动递增插件
userSchema.plugin(AutoIncrement, { inc_field: "userId" });

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema, "users");

// 添加签到子文档
UserModel.discriminator("SignIn", signInSchema);

export default UserModel;