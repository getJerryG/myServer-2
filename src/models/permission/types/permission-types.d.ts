import { Document, ObjectId } from "mongoose";
import type { Timestamps } from "~/base-types";

export type ResourceType = "contest" | "user" | "clan" | "room" | "system";

export type ModuleType = "manage" | "audit" | "data" | "schedule" | "participant" | "result" | "export" | "view";

export type OperationType = "admin" | "pass" | "reject" | "submit" | "edit" | "delete" | "view" | "export";

export type PermissionString = `${ResourceType}:${ModuleType}:${OperationType}`;

export interface IPermission extends Timestamps {
    _id: ObjectId;
    code: PermissionString;
    name: string;
    description: string;
    resource: ResourceType;
    module: ModuleType;
    operation: OperationType;
}

export interface IRole extends Timestamps {
    _id: ObjectId;
    name: string;
    code: string;
    description: string;
    permissions: PermissionString[];
    isSystem: boolean;
}

export interface IUserRole extends Timestamps {
    _id: ObjectId;
    userId: ObjectId;
    roleId: ObjectId;
    assignedBy: ObjectId;
    assignedAt: Date;
    expiresAt?: Date;
}

export type DataScopeType = "all" | "own" | "team" | "custom";

export interface DataScope {
    type: DataScopeType;
    customIds?: ObjectId[];
}

export interface IContestUserPermissionExtended extends Document {
    _id: ObjectId;
    user_id: ObjectId;
    contest_id: ObjectId;
    role: "creator" | "admin" | "participant" | "viewer";
    permissions: PermissionString[];
    dataScope?: DataScope;
    createdAt: Date;
    updatedAt: Date;
}

export interface PermissionCheckResult {
    hasPermission: boolean;
    reason?: string;
}

export interface UserPermissionCache {
    userId: ObjectId;
    permissions: PermissionString[];
    roles: string[];
    permissionsUpdatedAt: Date;
}
