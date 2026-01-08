import { Schema } from "mongoose";

const userTitleSchema = new Schema({
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
        required: true
    },
    endDateTime: {
        type: Date,
        required: false
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
            return ret;
        }
    }
});

export default userTitleSchema;
