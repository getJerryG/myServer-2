import { Schema, model, Document, Model } from "mongoose";

export interface RecordItem extends Document {
    title: string;
    peopleNum?: number;
    nickname: string;
    room: string;
    date?: string;
    time?: string;
    win: boolean;
    role: string;
    voteScore?: number;
    skillScore?: number;
    orderScore?: number;
    honor: "MVP" | "SVP" | "";
    type: "" | "" | "" | "" | "";
}

const recordSchema = new Schema<RecordItem>({
    title: String,
    peopleNum: {
        type: Number,
        default: 12,
        validate: {
            validator: (v: number) => v >= 6 && v <= 12,
            message: (props) => `${props.value} 不是有效的人数!`
        },
        required: false
    },
    nickname: String,
    room: String,
    date: {
        type: String,
        default: new Date().toISOString().slice(0, 10),
        required: false
    },
    time: {
        type: String,
        default: "19:00",
        validate: {
            validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: (props) => `${props.value} 不是有效的时间格式!`
        },
        required: false
    },
    win: Boolean,
    role: String,
    voteScore: {
        type: Number,
        default: 0,
        validate: {
            validator: (v: number) => v >= 0,
            message: (props) => `${props.value} 不能为负数!`
        },
        required: false
    },
    skillScore: {
        type: Number,
        default: 0,
        validate: {
            validator: (v: number) => v >= 0,
            message: (props) => `${props.value} 不能为负数!`
        },
        required: false
    },
    orderScore: {
        type: Number,
        default: 0,
        validate: {
            validator: (v: number) => v >= 0,
            message: (props) => `${props.value} 不能为负数!`
        },
        required: false
    },
    honor: {
        type: String,
        enum: ["MVP", "SVP", ""],
        default: ""
    },
    type: {
        type: String,
        enum: ["", "", "", "", ""],
        default: ""
    }
});

// 创建索引
recordSchema.index({ date: 1 });
recordSchema.index({ nickname: 1 });
recordSchema.index({ room: 1 });
recordSchema.index({ title: 1 });
recordSchema.index({ role: 1 });
recordSchema.index({ honor: 1 });
recordSchema.index({ type: 1 });

const RecordModel: Model<RecordItem> = model<RecordItem>("Record", recordSchema);

export default RecordModel;