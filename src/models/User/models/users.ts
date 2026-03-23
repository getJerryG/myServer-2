import mongoose, { Schema, Model, Document } from "mongoose";
import option from "../../../db/model/option";
import AutoIncrementFactory from "mongoose-sequence";
import signInSchema from "./signIn";
import { IUser } from "types/User";
import { ObjectId } from "mongoose";

interface UserDocument extends IUser, Document {
    id: string;
    userId: number;
    roleIds: ObjectId[];
    permissionsUpdatedAt?: Date;
    userID?: string;
    gamename?: string;
    exp?: number;
    signIn?: {
        signInDays: number;
        lastSignInTime: Date;
    };
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
        userID: {
            type: String,
            required: false
        },
        session_key: {
            type: String
        },
        nickname: {
            type: String,
            default: ""
        },
        gamename: {
            type: String,
            default: ""
        },
        avatar: {
            type: String,
            default: ""
        },
        exp: {
            type: Number,
            default: 0
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
            type: [Schema.Types.ObjectId],
            default: [],
            ref: "Title"
        },
        sex: {
            type: Number,
            default: 0
        },
        permission: {
            type: Number,
            default: 0
        },
        roleIds: {
            type: [Schema.Types.ObjectId],
            default: []
        },
        permissionsUpdatedAt: {
            type: Date
        }
    },
    option
);

// 初始化AutoIncrement插件
const AutoIncrement = AutoIncrementFactory(mongoose);
userSchema.plugin(AutoIncrement, { inc_field: "userId" });
userSchema.index({ roleIds: 1 }, { name: "role_ids_index" });
userSchema.index({ permissionsUpdatedAt: 1 }, { name: "permissions_updated_at_index" });

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema, "users");

UserModel.discriminator("SignIn", signInSchema);

export default UserModel;