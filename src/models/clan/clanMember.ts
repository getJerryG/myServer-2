export interface IClanMember {
    nickname: string;
    role?: "admin" | "member";
    createTime?: number;
    avatarUrl?: string;
    exp?: number;
}

export default class ClanMember {
    nickname: string;
    role: "admin" | "member";
    createTime: number;
    avatarUrl: string;
    exp: number;
    
    constructor(clanMemberOptions: IClanMember) {
        this.nickname = clanMemberOptions.nickname;
        this.role = clanMemberOptions.role || "member";
        this.createTime = clanMemberOptions.createTime || Date.now();
        this.avatarUrl = clanMemberOptions.avatarUrl || "userAvatars/default.png";
        this.exp = clanMemberOptions.exp || 0;
    }
    
    /**
     * 添加经验值
     */
    addExp(exp: number) {
        this.exp += Math.round(exp);
    }
    
    /**
     * 设置角色
     */
    setRole(role: "admin" | "member") {
        this.role = role;
    }
}