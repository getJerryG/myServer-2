import mongoose, { Schema, Model } from "mongoose";
import IRoom from "../interface/rooms";

// 房间Schema定义
const roomsSchema = new Schema<IRoom>({
    roomId: {
        type: Number,
        required: true,
        default: 1
    },
    options: {
        type: Object,
        default: {}
    },
    createTime: {
        type: Date,
        required: false,
        default: Date.now
    },
    updateTime: {
        type: Date,
        required: false,
        default: Date.now
    },
    heat: {
        type: Number,
        required: false,
        default: 0
    },
    liwu: {
        type: Number,
        required: false,
        default: 0
    },
    judge: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false
    },
    homeOwner: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: false
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game",
        required: false
    },
    result: {
        type: Object,
        default: {}
    },
    betScore: {
        type: Schema.Types.ObjectId,
        ref: "BetScore",
        required: false
    },
    users: [
        {
            userId: Schema.Types.ObjectId,
            seatId: Number
        }
    ],
    flowMessage: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true,
    versionKey: false
});

// 创建索引
roomsSchema.index({ openId: 1 }, { unique: true, name: 'openId_unique_index' });
roomsSchema.index({ userId: 1 }, { unique: true, name: 'userId_unique_index' });
roomsSchema.index({ role: 1, status: 1 }, { name: 'role_status_index' });
roomsSchema.index({ createTime: 1 }, { name: 'createTime_index' });
roomsSchema.index({ updateTime: 1 }, { name: 'updateTime_index' });
roomsSchema.index({ lastLoginTime: 1 }, { name: 'lastLoginTime_index' });
roomsSchema.index({ userId: 1, member: 1 }, { name: 'userId_member_index' });

// 房间模型
const RoomModel: Model<IRoom> = mongoose.model<IRoom>("Rooms", roomsSchema, "rooms");

export default RoomModel;