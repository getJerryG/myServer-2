import { Schema } from "mongoose";

const userSignInType = {
    signInDays: {
        type: Number,
        default: 0
    },
    lastSignInTime: {
        type: Date,
        default: Date.now
    }
};

const signInSchema = new Schema(userSignInType, {
    toJSON: {
        transform: (_doc, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default signInSchema;