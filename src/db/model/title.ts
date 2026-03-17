import { Schema, model, Document } from "mongoose";

// 标题接口定义
export interface ITitle extends Document {
    title: string;
    description?: string;
    titleImage?: string;
    titleType: string;
    createTime?: Date;
    updateTime?: Date;
    endDateTime?: Date;
}

// 标题Schema定义
const titleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    titleImage: {
        type: String,
        required: false,
        default: ""
    },
    titleType: {
        type: String,
        required: true,
        default: ""
    },
    endDateTime: {
        type: Date,
        required: false,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: "createTime",
        updatedAt: "updateTime",
        currentTime: () => Date.now()
    },
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// 标题模型
const TitleModel = model<ITitle>("Title", titleSchema);

export default TitleModel;