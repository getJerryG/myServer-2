// 家族成员角色枚举
export enum MemberRole {
    MEMBER = "member",
    ADMIN = "admin",
    LEADER = "leader"
}

// 家族状态枚举
export enum ClanStatus {
    ACTIVE = 1,
    DISSOLVED = 0
}

// 家族接口
export interface IClan {
    _id: string;
    name: string;
    leader: string;
    introduction?: string;
    coverUrl?: string;
    avatarUrl?: string;
    memberCount: number;
    totalExp: number;
    level: number;
    status: ClanStatus;
    createdAt: Date;
    updatedAt: Date;
}

// 家族成员接口
export interface IClanMember {
    _id: string;
    userId: string;
    clanId: string;
    role: MemberRole;
    joinTime: Date;
    exp: number;
    contribution: number;
    lastActiveTime: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 家族创建请求
export interface ClanCreateRequest {
    name: string;
    introduction?: string;
    coverUrl?: string;
    avatarUrl?: string;
}

// 家族更新请求
export interface ClanUpdateRequest {
    name?: string;
    introduction?: string;
    coverUrl?: string;
    avatarUrl?: string;
}

// 家族成员邀请请求
export interface ClanInviteRequest {
    clanId: string;
    userId: number;
}

// 家族成员踢出请求
export interface ClanKickRequest {
    clanId: string;
    userId: number;
}

// 家族成员角色变更请求
export interface ClanChangeRoleRequest {
    clanId: string;
    userId: number;
    role: MemberRole;
}