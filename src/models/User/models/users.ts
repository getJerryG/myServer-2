import mongoose, { Schema, Model, Document, ObjectId } from "mongoose";
import option from "@/models/shared/option";
import AutoIncrementFactory from "mongoose-sequence";
import signInSchema from "./signIn";

// 直接定义IUser接口，与types/User.d.ts保持一致
interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export type UserStatus = 0 | 1 | 2 | 3 | 4;
export type UserRole = 0 | 1 | 2;
export type UserSex = 0 | 1 | 2;

interface UserSignIn {
    signInDays: number;
    lastSignInTime: Date;
}

interface UserBase extends Timestamps {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: UserSex;
    avatar: string;
    exp: number;
    status: UserStatus;
    role: UserRole;
    session_key: string;
    signIn: UserSignIn;
    permission: number;
    roleIds: Schema.Types.ObjectId[];
    permissionsUpdatedAt?: Date;
}

type IUser = UserBase;

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