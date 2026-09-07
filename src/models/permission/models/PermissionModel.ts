import mongoose, { Schema, Model } from "mongoose";
import option from "@/models/shared/option";
import { IPermission } from "../types/permission-types";

const permissionSchema = new Schema<IPermission>(
    {
        code: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        resource: {
            type: String,
            required: true,
            enum: ["contest", "user", "clan", "room", "system"]
        },
        module: {
            type: String,
            required: true,
            enum: ["manage", "audit", "data", "schedule", "participant", "result", "export", "view"]
        },
        operation: {
            type: String,
            required: true,
            enum: ["admin", "pass", "reject", "submit", "edit", "delete", "view", "export"]
        }
    },
    option
);

permissionSchema.index({ resource: 1, module: 1, operation: 1 }, { name: "resource_module_operation_index" });
permissionSchema.index({ code: 1 }, { unique: true, name: "code_unique_index" });

permissionSchema.statics.createPermission = async function (data: Partial<IPermission>) {
    return await this.create(data);
};

permissionSchema.statics.findByCode = async function (code: string) {
    return await this.findOne({ code });
};

permissionSchema.statics.findByResource = async function (resource: string) {
    return await this.find({ resource });
};

permissionSchema.statics.findByModule = async function (module: string) {
    return await this.find({ module });
};

permissionSchema.statics.findAllPermissions = async function () {
    return await this.find({});
};

permissionSchema.statics.updatePermission = async function (code: string, updateData: Partial<IPermission>) {
    return await this.findOneAndUpdate({ code }, updateData, { new: true });
};

permissionSchema.statics.deletePermission = async function (code: string) {
    return await this.findOneAndDelete({ code });
};

permissionSchema.statics.batchCreatePermissions = async function (permissions: Partial<IPermission>[]) {
    return await this.insertMany(permissions);
};

const PermissionModel: Model<IPermission> = mongoose.model<IPermission>(
    "Permissions",
    permissionSchema,
    "permissions"
);

export default PermissionModel;
