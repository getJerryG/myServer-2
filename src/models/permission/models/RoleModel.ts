import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IRole } from "../types/permission-types";

const roleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        permissions: {
            type: [String],
            required: true,
            default: []
        },
        isSystem: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    option
);

roleSchema.index({ code: 1 }, { unique: true, name: "code_unique_index" });
roleSchema.index({ isSystem: 1 }, { name: "is_system_index" });

roleSchema.statics.createRole = async function (data: Partial<IRole>) {
    return await this.create(data);
};

roleSchema.statics.findByCode = async function (code: string) {
    return await this.findOne({ code });
};

roleSchema.statics.findAllRoles = async function () {
    return await this.find({});
};

roleSchema.statics.findSystemRoles = async function () {
    return await this.find({ isSystem: true });
};

roleSchema.statics.findCustomRoles = async function () {
    return await this.find({ isSystem: false });
};

roleSchema.statics.updateRole = async function (code: string, updateData: Partial<IRole>) {
    return await this.findOneAndUpdate({ code }, updateData, { new: true });
};

roleSchema.statics.deleteRole = async function (code: string) {
    return await this.findOneAndDelete({ code });
};

roleSchema.statics.addPermissionsToRole = async function (code: string, permissions: string[]) {
    return await this.findOneAndUpdate(
        { code },
        { $addToSet: { permissions } },
        { new: true }
    );
};

roleSchema.statics.removePermissionsFromRole = async function (code: string, permissions: string[]) {
    return await this.findOneAndUpdate(
        { code },
        { $pullAll: { permissions: { $in: permissions } } },
        { new: true }
    );
};

const RoleModel: Model<IRole> = mongoose.model<IRole>(
    "Roles",
    roleSchema,
    "roles"
);

export default RoleModel;
