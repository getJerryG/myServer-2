import { Schema, model } from "mongoose";
import type { IGame } from "~/Game";
import { Winner, WerewolfRole, VoteType } from "@/data/Game-enum";

const GameSchema = new Schema<IGame>({
    state: {
        phase: {
            type: String,
            enum: ["DAY", "NIGHT"],
            required: false,
            default: "NIGHT"
        },
        round: {
            type: Number,
            required: false,
            default: 0
        },
        currentSpeaker: {
            type: Number,
            required: false,
            default: -1
        },
        startSpeakerSeat: Number, // 起始发言座位
        nextSpeakerSeat: Number // 下一个发言座位
    },
    players: [{
        seat: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        isSurvival: {
            type: Boolean,
            required: true,
            default: true
        },
        role: {
            type: String,
            enum: WerewolfRole,
            required: true
        },
        online: {
            type: Boolean,
            required: false,
            default: true
        },
        causeOfDeath: {
            type: String,
            required: false,
            default: ""
        }
    }],
    winner: {
        type: String,
        enum: Winner,
        required: false
    },
    playersCount: {
        type: Number,
        required: false,
        default: 12
    },
    votes: {
        type: [{
            type: {
                type: String,
                enum: VoteType,
                required: false
            },
            dayNumber: Number,
            result: {
                maxVotes: Number, // 最高票数
                targetSeat: Number, // 目标座位
                isTie: Boolean, // 是否平局
                tiePlayers: [Number], // 平局玩家
                voteRecords: {
                    type: Map,
                    of: Number,
                    required: false
                } // 投票记录: {座位号: 得票数}
            },
            required: false
        }],
        required: false,
        default: []
    },
    currentVote: {
        type: {
            type: String,
            enum: VoteType,
            required: false
        },
        dayNumber: Number,
        records: {
            type: Map,
            of: Number,
            required: false
        }
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
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// 创建索引
GameSchema.index({ winner: 1 }, { name: "winner_index" });

const Game = model<IGame>("Game", GameSchema);
export default Game;