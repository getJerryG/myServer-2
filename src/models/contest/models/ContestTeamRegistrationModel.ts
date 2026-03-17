import { Schema, model } from "mongoose";
import { IContestTeamRegistration } from "../types/contest";

const contestTeamRegistrationSchema = new Schema<IContestTeamRegistration>({
    contestId: {
        type: String,
        required: true,
        ref: "Contests"
    },
    teamId: {
        type: String,
        required: true,
        ref: "Teams"
    },
    teamName: {
        type: String,
        required: true
    },
    leaderId: {
        type: Number,
        required: true
    },
    clanId: {
        type: String,
        required: true
    },
    members: {
        type: [{
            userId: Number,
            username: String
        }],
        required: true,
        default: []
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

const ContestTeamRegistrationModel = model<IContestTeamRegistration>(
    "ContestTeamRegistration",
    contestTeamRegistrationSchema,
    "contest_team_registrations"
);

// 静态方法
ContestTeamRegistrationModel.getRegistrationByContestAndTeam = async (
    contestId: string,
    teamId: string
): Promise<IContestTeamRegistration | null> => {
    return await ContestTeamRegistrationModel.findOne({ contestId, teamId });
};

ContestTeamRegistrationModel.getRegistrationByContestIdAndUserId = async (
    contestId: string,
    userId: number
): Promise<IContestTeamRegistration[]> => {
    return await ContestTeamRegistrationModel.find({
        contestId,
        $or: [
            { leaderId: userId },
            { "members.userId": userId }
        ]
    });
};

export default ContestTeamRegistrationModel;