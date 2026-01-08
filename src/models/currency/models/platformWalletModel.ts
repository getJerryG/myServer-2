import { Schema, model } from "mongoose";
import { IPlatformWallet } from "../types/currency";

const platformWalletSchema = new Schema<IPlatformWallet>({
    currencyType: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 1000 // 100
    },
    autoReplenish: {
        type: Boolean,
        required: true,
        default: true // 
    },
    replenishThreshold: {
        type: Number,
        required: true,
        default: 1000 // 100
    },
    replenishAmount: {
        type: Number,
        required: true,
        default: 1000 // 100
    },
    lastReplenishAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    }
});

platformWalletSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const PlatformWallet = model<IPlatformWallet>("PlatformWallet", platformWalletSchema);

export default PlatformWallet;