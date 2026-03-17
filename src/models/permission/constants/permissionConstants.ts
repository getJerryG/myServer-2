import type { PermissionString } from "./types/permission-types";

export const PERMISSIONS = {
    CONTEST_MANAGE_ADMIN: "contest:manage:admin" as PermissionString,
    CONTEST_AUDIT_PASS: "contest:audit:pass" as PermissionString,
    CONTEST_AUDIT_REJECT: "contest:audit:reject" as PermissionString,
    CONTEST_DATA_SUBMIT: "contest:data:submit" as PermissionString,
    CONTEST_SCHEDULE_EDIT: "contest:schedule:edit" as PermissionString,
    CONTEST_PARTICIPANT_MANAGE: "contest:participant:manage" as PermissionString,
    CONTEST_RESULT_VIEW: "contest:result:view" as PermissionString,
    CONTEST_EXPORT: "contest:export:view" as PermissionString,
    CONTEST_VIEW: "contest:view:view" as PermissionString,
    
    USER_MANAGE_ADMIN: "user:manage:admin" as PermissionString,
    USER_VIEW: "user:view:view" as PermissionString,
    USER_EDIT: "user:manage:edit" as PermissionString,
    
    CLAN_MANAGE_ADMIN: "clan:manage:admin" as PermissionString,
    CLAN_MEMBER_MANAGE: "clan:participant:manage" as PermissionString,
    
    ROOM_MANAGE_ADMIN: "room:manage:admin" as PermissionString,
    ROOM_KICK: "room:manage:delete" as PermissionString,
    
    SYSTEM_MANAGE_ADMIN: "system:manage:admin" as PermissionString,
    SYSTEM_CONFIG: "system:manage:edit" as PermissionString
} as const;

export const ROLE_CODES = {
    SYSTEM_ADMIN: "system_admin",
    CONTEST_ADMIN: "contest_admin",
    CONTEST_VIEWER: "contest_viewer",
    USER_ADMIN: "user_admin",
    CLAN_ADMIN: "clan_admin",
    ROOM_ADMIN: "room_admin"
} as const;

export const ROLE_NAMES = {
    SYSTEM_ADMIN: "系统管理员",
    CONTEST_ADMIN: "赛事管理员",
    CONTEST_VIEWER: "赛事查看者",
    USER_ADMIN: "用户管理员",
    CLAN_ADMIN: "公会管理员",
    ROOM_ADMIN: "房间管理员"
} as const;

export const DEFAULT_ROLES = {
    SYSTEM_ADMIN: {
        code: ROLE_CODES.SYSTEM_ADMIN,
        name: ROLE_NAMES.SYSTEM_ADMIN,
        permissions: Object.values(PERMISSIONS),
        isSystem: true
    },
    CONTEST_ADMIN: {
        code: ROLE_CODES.CONTEST_ADMIN,
        name: ROLE_NAMES.CONTEST_ADMIN,
        permissions: [
            PERMISSIONS.CONTEST_MANAGE_ADMIN,
            PERMISSIONS.CONTEST_AUDIT_PASS,
            PERMISSIONS.CONTEST_AUDIT_REJECT,
            PERMISSIONS.CONTEST_DATA_SUBMIT,
            PERMISSIONS.CONTEST_SCHEDULE_EDIT,
            PERMISSIONS.CONTEST_PARTICIPANT_MANAGE,
            PERMISSIONS.CONTEST_RESULT_VIEW,
            PERMISSIONS.CONTEST_EXPORT,
            PERMISSIONS.CONTEST_VIEW
        ],
        isSystem: true
    },
    CONTEST_VIEWER: {
        code: ROLE_CODES.CONTEST_VIEWER,
        name: ROLE_NAMES.CONTEST_VIEWER,
        permissions: [
            PERMISSIONS.CONTEST_VIEW,
            PERMISSIONS.CONTEST_RESULT_VIEW
        ],
        isSystem: true
    }
} as const;

export const CACHE_KEYS = {
    USER_PERMISSIONS: (userId: string) => `wolf:permissions:${userId}`,
    USER_ROLES: (userId: string) => `wolf:roles:${userId}`,
    TOKEN_MAPPING: (userId: string) => `wolf:token:${userId}`,
    PERMISSION_DEFINITIONS: () => "wolf:permissions:definitions"
} as const;

export const CACHE_TTL = {
    PERMISSIONS: 7200,
    ROLES: 7200,
    DEFINITIONS: 86400,
    TOKEN: 7200
} as const;

export const ERROR_CODES = {
    PERMISSION_DENIED: 403,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 4011002,
    TOKEN_MISSING: 4011001
} as const;

export const ERROR_MESSAGES = {
    PERMISSION_DENIED: "权限不足",
    TOKEN_INVALID: "Token无效",
    TOKEN_EXPIRED: "Token已过期",
    TOKEN_MISSING: "缺少Token",
    USER_NOT_FOUND: "用户不存在",
    ROLE_NOT_FOUND: "角色不存在",
    PERMISSION_NOT_FOUND: "权限不存在"
} as const;
