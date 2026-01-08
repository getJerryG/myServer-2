import { Document, Schema } from "mongoose";
import { WerewolfRole, Winner, VoteType } from "@/data/Game-enum";

export type VoteRecord = Record<number, number>;

export interface VoteResult {
    type: string;
    maxVotes: number;
    targetSeat?: number;
    isTie: boolean;
    tiePlayers?: number[];
    voteRecords: VoteRecord;
}

export interface GameVote {
    type: VoteType;
    dayNumber: number;
    result: VoteResult;
}

export interface IPlayer {
    seat: number;
    user: Schema.Types.ObjectId;
    isSurvival: boolean;
    role?: WerewolfRole;
    online?: boolean;
    causeOfDeath?: string;
}

export interface GameState {
    phase?: "DAY" | "NIGHT"; // DAY or NIGHT
    round?: number;
    currentSpeaker?: number;
    startSpeakerSeat: number;
    nextSpeakerSeat: number;
}

export interface IGame extends Document {
    roles: Record<string, WerewolfRole>;
    state: GameState;
    players: IPlayer[];
    winner: Winner;
    room: Schema.Types.ObjectId;
    playersCount: number;
    votes: GameVote[];
    currentVote?: {
        type: VoteType;
        dayNumber: number;
        records: VoteRecord;
    };
}
