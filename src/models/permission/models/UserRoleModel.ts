import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IUserRole } from "../types/permission-types";

const userRoleSchema = new Schema<IUserRole>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Users"
        },
        roleId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Roles"
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Users"
        },
        assignedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: false
        }
    },
    option
);

userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true, name: "user_role_unique_index" });
userRoleSchema.index({ userId: 1 }, { name: "user_id_index" });
userRoleSchema.index({ roleId: 1 }, { name: "role_id_index" });
userRoleSchema.index({ expiresAt: 1 }, { name: "expires_at_index", expireAfterSeconds: 0 });

userRoleSchema.statics.createUserRole = async function (data: Partial<IUserRole>) {
    return await this.create(data);
};

userRoleSchema.statics.findByUserId = async function (userId: mongoose.Types.ObjectId) {
    const now = new Date();
    return await this.find({
        userId,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } }
        ]
    }).populate(["userId", "roleId"]);
};

userRoleSchema.statics.findByRoleId = async function (roleId: mongoose.Types.ObjectId) {
    return await this.find({ roleId }).populate(["userId", "roleId"]);
};

userRoleSchema.statics.findByUserAndRole = async function (
    userId: mongoose.Types.ObjectId, 
    roleId: mongoose.Types.ObjectId
) {
    const now = new Date();
    return await this.findOne({
        userId,
        roleId,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: now } }
        ]
    }).populate(["userId", "roleId"]);
};

userRoleSchema.statics.updateUserRole = async function (userId: mongoose.Types.ObjectId, roleId: mongoose.Types.ObjectId, updateData: Partial<IUserRole>) {
    return await this.findOneAndUpdate(
        { userId, roleId },
        updateData,
        { new: true }
    ).populate(["userId", "roleId"]);
};

userRoleSchema.statics.deleteUserRole = async function (userId: mongoose.Types.ObjectId, roleId: mongoose.Types.ObjectId) {
    return await this.findOneAndDelete({ userId, roleId });
};

userRoleSchema.statics.deleteAllUserRoles = async function (userId: mongoose.Types.ObjectId) {
    return await this.deleteMany({ userId });
};

userRoleSchema.statics.assignRolesToUser = async function (userId: mongoose.Types.ObjectId, roleIds: mongoose.Types.ObjectId[], assignedBy: mongoose.Types.ObjectId) {
    const userRoles = roleIds.map(roleId => ({
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date()
    }));
    return await this.insertMany(userRoles);
};

userRoleSchema.statics.revokeRoleFromUser = async function (userId: mongoose.Types.ObjectId, roleId: mongoose.Types.ObjectId) {
    return await this.findOneAndDelete({ userId, roleId });
};

const UserRoleModel: Model<IUserRole> = mongoose.model<IUserRole>(
    "UserRoles",
    userRoleSchema,
    "user_roles"
);

export default UserRoleModel;
