import { Schema, model } from "mongoose";
import { IPlatformWallet, ReplenishStatus } from "../types/currency";

const platformWalletSchema = new Schema<IPlatformWallet>({
    currencyType: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true
    },
    autoReplenish: {
        type: Boolean,
        required: true,
        default: true
    },
    replenishThreshold: {
        type: Number,
        required: true,
        default: 1000
    },
    replenishAmount: {
        type: Number,
        required: true,
        default: 1000
    },
    lastReplenishAt: {
        type: Date,
        default: null
    },
    replenishStatus: {
        type: String,
        required: true,
        enum: Object.values(ReplenishStatus),
        default: ReplenishStatus.IDLE
    },
    nextReplenishAt: {
        type: Date,
        default: null
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

const PlatformWallet = model<IPlatformWallet>("PlatformWallet", platformWalletSchema);

export default PlatformWallet;