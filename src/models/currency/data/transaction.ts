import { Schema, model } from "mongoose";
import { ITransaction } from "../types/currency";

const transactionSchema = new Schema<ITransaction>({
    user: {
        type: String,
        required: true,
        ref: "Users"
    },
    currencyType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    beforeBalance: {
        type: Number,
        required: true
    },
    afterBalance: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    referenceId: {
        type: String,
        required: true
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

const Transaction = model<ITransaction>("Transaction", transactionSchema);

export default Transaction;