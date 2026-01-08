import { Schema, model } from "mongoose";
import { ICurrencyType, CurrencyStatus, CurrencyTypeId } from "../types/currency";

const currencyTypeSchema = new Schema<ICurrencyType>({
    id: {
        type: String,
        required: true,
        unique: true,
        enum: Object.values(CurrencyTypeId)
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    decimal: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        required: true,
        enum: [CurrencyStatus.ENABLED, CurrencyStatus.DISABLED],
        default: CurrencyStatus.ENABLED
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

currencyTypeSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const CurrencyType = model<ICurrencyType>("CurrencyType", currencyTypeSchema);

export default CurrencyType;