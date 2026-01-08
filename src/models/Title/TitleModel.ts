import mongoose, { Schema, Model, Document } from "mongoose";
import option from "../../db/model/option";

/**
 * 头衔状态枚举
 */
export enum TitleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    PENDING = "pending"
}

/**
 * 头衔类型
 */
export type TitleType = "achievement" | "honor" | "activity" | "season" | "clan" | "special" | "custom" | "system";

/**
 * 头衔获取条件
 */
export interface TitleCondition {
    requiredLevel?: number;
    requiredExp?: number;
    requiredAchievements?: string[];
    requiredHonors?: string[];
    requiredClanRank?: number;
    timeLimit?: boolean;
}

/**
 * 头衔接口
 */
export interface ITitle extends Document {
    id: string;
    title: string;
    description: string;
    type: TitleType;
    image?: string;
    status: TitleStatus;
    createdAt: Date;
    updatedAt: Date;
    expiredAt?: Date;
    conditions: TitleCondition;
    category: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    isTimeLimited: boolean;
}

/**
 * 用户头衔接口
 */
export interface IUserTitle extends Document {
    userId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: "active" | "equipped" | "expired" | "revoked";
    equipped: boolean;
    revokedAt?: Date;
    metadata?: Record<string, any>;
}

/**
 * 战队头衔接口
 */
export interface IClanTitle extends Document {
    clanId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: "active" | "expired" | "revoked";
    revokedAt?: Date;
    metadata?: Record<string, any>;
}

/**
 * 头衔授予记录接口
 */
export interface ITitleGrantRecord extends Document {
    recordId: string;
    titleId: mongoose.Types.ObjectId;
    recipientType: "user" | "clan";
    recipientId: mongoose.Types.ObjectId;
    grantType: "auto" | "manual";
    grantedBy: mongoose.Types.ObjectId;
    grantedAt: Date;
    expireAt?: Date;
    status: "granted" | "revoked" | "expired";
    reason?: string;
    metadata?: Record<string, any>;
}

/**
 * 头衔Schema
 */
const titleSchema = new Schema<ITitle>(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            index: true
        },
        image: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(TitleStatus),
            default: TitleStatus.ACTIVE,
            index: true
        },
        expiredAt: {
            type: Date,
            required: false,
            index: true
        },
        conditions: {
            type: Object,
            required: true,
            default: {}
        },
        category: {
            type: String,
            required: true,
            default: "default",
            index: true
        },
        rarity: {
            type: String,
            required: true,
            enum: ["common", "rare", "epic", "legendary"],
            default: "common",
            index: true
        },
        isTimeLimited: {
            type: Boolean,
            required: true,
            default: false,
            index: true
        }
    },
    option
);

/**
 * 用户头衔Schema
 */
const userTitleSchema = new Schema<IUserTitle>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Users",
            index: true
        },
        titleId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Titles",
            index: true
        },
        obtainedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "equipped", "expired", "revoked"],
            default: "active",
            index: true
        },
        equipped: {
            type: Boolean,
            required: true,
            default: false,
            index: true
        },
        revokedAt: {
            type: Date,
            required: false
        },
        metadata: {
            type: Object,
            required: false,
            default: {}
        }
    },
    option
);

// 创建唯一索引
userTitleSchema.index({ userId: 1, titleId: 1 }, { unique: true });

/**
 * 战队头衔Schema
 */
const clanTitleSchema = new Schema<IClanTitle>(
    {
        clanId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Clans",
            index: true
        },
        titleId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Titles",
            index: true
        },
        obtainedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "expired", "revoked"],
            default: "active",
            index: true
        },
        revokedAt: {
            type: Date,
            required: false
        },
        metadata: {
            type: Object,
            required: false,
            default: {}
        }
    },
    option
);

// 创建唯一索引
clanTitleSchema.index({ clanId: 1, titleId: 1 }, { unique: true });

/**
 * 头衔授予记录Schema
 */
const titleGrantRecordSchema = new Schema<ITitleGrantRecord>(
    {
        recordId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        titleId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Titles",
            index: true
        },
        recipientType: {
            type: String,
            required: true,
            enum: ["user", "clan"],
            index: true
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        grantType: {
            type: String,
            required: true,
            enum: ["auto", "manual"],
            index: true
        },
        grantedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Users",
            index: true
        },
        grantedAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        expireAt: {
            type: Date,
            required: false
        },
        status: {
            type: String,
            required: true,
            enum: ["granted", "revoked", "expired"],
            default: "granted",
            index: true
        },
        reason: {
            type: String,
            required: false
        },
        metadata: {
            type: Object,
            required: false,
            default: {}
        }
    },
    option
);

/**
 * 模型导出
 */
export const Title: Model<ITitle> = mongoose.model<ITitle>("Titles", titleSchema, "titles");
export const UserTitle: Model<IUserTitle> = mongoose.model<IUserTitle>("UserTitles", userTitleSchema, "user_titles");
export const ClanTitle: Model<IClanTitle> = mongoose.model<IClanTitle>("ClanTitles", clanTitleSchema, "clan_titles");
export const TitleGrantRecord: Model<ITitleGrantRecord> = mongoose.model<ITitleGrantRecord>(
    "TitleGrantRecords",
    titleGrantRecordSchema,
    "title_grant_records"
);

export default {
    Title,
    UserTitle,
    ClanTitle,
    TitleGrantRecord
};