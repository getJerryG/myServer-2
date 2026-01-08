import { Document, ObjectId } from "mongoose";

// 权限角色枚举
export type ContestPermissionRole = "creator" | "admin" | "participant" | "viewer";

// 权限详情接口
export interface ContestPermissionDetails {
    view: boolean;
    edit: boolean;
    submitData: boolean;
    manageAdmins: boolean;
    manageParticipants: boolean;
    manageSchedule: boolean;
    viewResults: boolean;
    exportData: boolean;
}

// 用户-赛事权限关联接口
export interface IContestUserPermission extends Document {
    user_id: ObjectId;
    contest_id: ObjectId;
    role: ContestPermissionRole;
    permissions: ContestPermissionDetails;
    createdAt: Date;
    updatedAt: Date;
}
