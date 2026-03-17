import { Schema, model } from "mongoose";
import { IWallet, WalletType, WalletStatus } from "../types/currency";

const walletSchema = new Schema<IWallet>({
    userId: {
        type: Schema.Types.ObjectId,
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
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            ret.balances = Object.fromEntries(ret.balances);
        }
    }
});

walletSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const Wallet = model<IWallet>("Wallet", walletSchema);

export default Wallet;