import { Schema, model } from "mongoose";
import { IClanMember, MemberRole } from "../types/clan";

const clanMemberSchema = new Schema<IClanMember>({
    userId: {
        type: String,
        required: true
    },
    clanId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(MemberRole),
        default: MemberRole.MEMBER
    },
    joinTime: {
        type: Date,
        default: Date.now
    },
    exp: {
        type: Number,
        default: 0
    },
    contribution: {
        type: Number,
        default: 0
    },
    lastActiveTime: {
        type: Date,
        default: Date.now
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

const ClanMember = model<IClanMember>("ClanMember", clanMemberSchema);

export default ClanMember;