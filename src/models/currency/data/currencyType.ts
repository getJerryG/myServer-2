import { Schema, model } from "mongoose";
import { ICurrencyType, CurrencyTypeId } from "../types/currency";

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
        required: true
    },
    decimal: {
        type: Number,
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

const CurrencyType = model<ICurrencyType>("CurrencyType", currencyTypeSchema);

export default CurrencyType;