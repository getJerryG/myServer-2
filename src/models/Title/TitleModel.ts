import mongoose, { Schema, Model } from "mongoose";
import option from "../../db/model/option";
import type { Timestamps, WithMetadata, WithDocument } from "~/base-types";

export enum TitleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    PENDING = "pending"
}

export type TitleType = "achievement" | "honor" | "activity" | "season" | "clan" | "special" | "custom" | "system";

export interface TitleCondition {
    requiredLevel?: number;
    requiredExp?: number;
    requiredAchievements?: string[];
    requiredHonors?: string[];
    requiredClanRank?: number;
    timeLimit?: boolean;
}

export interface TitleBase extends Timestamps {
    id: string;
    title: string;
    description: string;
    type: TitleType;
    image?: string;
    status: TitleStatus;
    expiredAt?: Date;
    conditions: TitleCondition;
    category: string;
    rarity: TitleRarity;
    isTimeLimited: boolean;
}

export type TitleRarity = "common" | "rare" | "epic" | "legendary";

export type UserTitleStatus = "active" | "equipped" | "expired" | "revoked";

export type ClanTitleStatus = "active" | "expired" | "revoked";

export type GrantType = "auto" | "manual";

export type RecipientType = "user" | "clan";

export type GrantStatus = "granted" | "revoked" | "expired";

export interface UserTitleBase extends Timestamps, WithMetadata {
    userId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: UserTitleStatus;
    equipped: boolean;
    revokedAt?: Date;
}

export interface ClanTitleBase extends Timestamps, WithMetadata {
    clanId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: ClanTitleStatus;
    revokedAt?: Date;
}

export interface TitleGrantRecordBase extends Timestamps, WithMetadata {
    recordId: string;
    titleId: mongoose.Types.ObjectId;
    recipientType: RecipientType;
    recipientId: mongoose.Types.ObjectId;
    grantType: GrantType;
    grantedBy: mongoose.Types.ObjectId;
    grantedAt: Date;
    expireAt?: Date;
    status: GrantStatus;
    reason?: string;
}

export type ITitle = WithDocument<TitleBase>;
export type IUserTitle = WithDocument<UserTitleBase>;
export type IClanTitle = WithDocument<ClanTitleBase>;
export type ITitleGrantRecord = WithDocument<TitleGrantRecordBase>;

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

userTitleSchema.index({ userId: 1, titleId: 1 }, { unique: true });

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

clanTitleSchema.index({ clanId: 1, titleId: 1 }, { unique: true });

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
