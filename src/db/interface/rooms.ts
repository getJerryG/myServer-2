import { Schema, Document } from "mongoose";

export default interface IRoom extends Document {
    roomId: number;
    options: object;
    createTime: Date;
    updateTime: Date;
    heat: number;
    liwu: number;
    judge: Schema.Types.ObjectId;
    from: Schema.Types.ObjectId;
    homeOwner: Schema.Types.ObjectId;
    game: Schema.Types.ObjectId;
    result: object;
    betScore: Schema.Types.ObjectId;
    users: Array<{
        userId: Schema.Types.ObjectId;
        seatId: number;
    }>;
    flowMessage: object;
}