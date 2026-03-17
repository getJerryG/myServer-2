import { Schema, model } from "mongoose";
import { ITransaction, TransactionType, TransactionStatus } from "../types/currency";

const transactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
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
        required: true,
        enum: [
            TransactionType.RECHARGE,
            TransactionType.WITHDRAW,
            TransactionType.CONSUMPTION,
            TransactionType.REWARD,
            TransactionType.EXCHANGE,
            TransactionType.TRANSFER
        ]
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        required: true,
        enum: [
            TransactionStatus.SUCCESS,
            TransactionStatus.FAILURE,
            TransactionStatus.PROCESSING
        ],
        default: TransactionStatus.SUCCESS
    },
    referenceId: {
        type: String,
        default: ""
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

transactionSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const Transaction = model<ITransaction>("Transaction", transactionSchema);

export default Transaction;