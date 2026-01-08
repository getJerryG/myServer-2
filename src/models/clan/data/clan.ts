import { Schema, model } from "mongoose";
import { IClan, ClanStatus } from "../types/clan";

const clanSchema = new Schema<IClan>({
    name: {
        type: String,
        required: true
    },
    leader: {
        type: String,
        required: true
    },
    introduction: {
        type: String,
        default: ""
    },
    coverUrl: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    memberCount: {
        type: Number,
        default: 1
    },
    totalExp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    status: {
        type: Number,
        enum: [ClanStatus.ACTIVE, ClanStatus.DISSOLVED],
        default: ClanStatus.ACTIVE
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

const Clan = model<IClan>("Clan", clanSchema);

export default Clan;