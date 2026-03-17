import { Schema, model } from "mongoose";
import { IWallet, WalletType, WalletStatus } from "../types/currency";

const walletSchema = new Schema<IWallet>({
    user: {
        type: String,
        required: true,
        ref: "Users"
    },
    type: {
        type: String,
        required: true,
        enum: Object.values(WalletType)
    },
    balances: {
        type: Map,
        of: Number,
        required: true,
        default: {}
    },
    status: {
        type: Number,
        required: true,
        enum: [WalletStatus.NORMAL, WalletStatus.FROZEN],
        default: WalletStatus.NORMAL
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
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            // 将 Map 转换为 JSON 对象
            ret.balances = Object.fromEntries(ret.balances);
        }
    }
});

// 更新 updatedAt 字段
walletSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const Wallet = model<IWallet>("Wallet", walletSchema);

export default Wallet;