import mongoose, { Schema, Model } from "mongoose";
import option from "../../../db/model/option";
import { IContestUserPermission } from "../types/contest-user-permission-types";

/**
 * 用户-赛事权限关联模型Schema
 */
const contestUserPermissionSchema = new Schema<IContestUserPermission>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Users"
        },
        contest_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Contests"
        },
        role: {
            type: String,
            required: true,
            enum: ["creator", "admin", "participant", "viewer"],
            default: "viewer"
        },
        permissions: {
            type: Object,
            required: true,
            default: {
                view: true,
                edit: false,
                submitData: false,
                manageAdmins: false,
                manageParticipants: false,
                manageSchedule: false,
                viewResults: true,
                exportData: false
            }
        }
    },
    option
);

// 创建联合唯一索引，防止重复关联记录
contestUserPermissionSchema.index({ user_id: 1, contest_id: 1 }, { unique: true, name: "user_contest_unique_index" });

// 为user_id和contest_id分别创建索引，优化查询性能
contestUserPermissionSchema.index({ user_id: 1 }, { name: "user_id_index" });
contestUserPermissionSchema.index({ contest_id: 1 }, { name: "contest_id_index" });

// 静态方法
contestUserPermissionSchema.statics.createPermission = async function (data: Partial<IContestUserPermission>) {
    return await this.create(data);
};

contestUserPermissionSchema.statics.findByUserId = async function (userId: mongoose.Types.ObjectId) {
    return await this.find({ user_id: userId }).populate(["user_id", "contest_id"]);
};

contestUserPermissionSchema.statics.findByContestId = async function (
    contestId: mongoose.Types.ObjectId
) {
    return await this.find({ contest_id: contestId })
        .populate(["user_id", "contest_id"]);
};

contestUserPermissionSchema.statics.findByUserIdAndContestId = async function (
    userId: mongoose.Types.ObjectId, 
    contestId: mongoose.Types.ObjectId
) {
    return await this.findOne({ user_id: userId, contest_id: contestId })
        .populate(["user_id", "contest_id"]);
};

contestUserPermissionSchema.statics.updatePermission = async function (
    userId: mongoose.Types.ObjectId, 
    contestId: mongoose.Types.ObjectId, 
    updateData: Partial<IContestUserPermission>
) {
    return await this.findOneAndUpdate(
        { user_id: userId, contest_id: contestId },
        updateData,
        { new: true }
    ).populate(["user_id", "contest_id"]);
};

contestUserPermissionSchema.statics.deletePermission = async function (
    userId: mongoose.Types.ObjectId, 
    contestId: mongoose.Types.ObjectId
) {
    return await this.findOneAndDelete({ user_id: userId, contest_id: contestId });
};

// 创建并导出模型
const ContestUserPermissionModel: Model<IContestUserPermission> = mongoose.model<IContestUserPermission>(
    "ContestUserPermissions", 
    contestUserPermissionSchema,
    "contest_user_permissions"
);

export default ContestUserPermissionModel;
