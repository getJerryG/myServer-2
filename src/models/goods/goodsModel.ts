import { Schema, Document, model, Model } from "mongoose";

interface GoodsInterface {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    status: number;
    createTime: number;
    updateTime: number;
}

interface GoodsDocument extends GoodsInterface, Document {
    id: string;
}

const GoodsSchema = new Schema<GoodsDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: Number,
            required: true,
            enum: [0, 1],
            default: 1
        },
        createTime: {
            type: Number,
            default: Date.now
        },
        updateTime: {
            type: Number,
            default: Date.now
        }
    },
    {
        timestamps: {
            createdAt: "createTime",
            updatedAt: "updateTime"
        },
        versionKey: false
    }
);

const GoodsModel: Model<GoodsDocument> = model("Goods", GoodsSchema);

export default GoodsModel;
export type { GoodsDocument, GoodsInterface };