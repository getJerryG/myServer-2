const defaultCoverUrl = "clan/cover.png";
const defaultAvatarUrl = "clan/clanImg.jpg";
import ClanMember from "./clanMember";
import RedisCacheManager from "../../utils/redisCache";
import { TitleBase, TitleStatus, TitleStatusType } from "../Title";
import { titleLibrary } from "../Title";

export interface IClanOptions {
    name?: string;
    leader: string;
    introduction?: string;
    coverUrl?: string;
    avatarUrl?: string;
}

export default class Clan {
    static id = 0;
    name: string;
    introduction?: string;
    coverUrl?: string;
    avatarUrl?: string;
    leader: string;
    _admin = new Map<string, ClanMember>();
    _members = new Map<string, ClanMember>();
    _contests = new Map<string, any>();
    _teams: any[] = [];
    _honors = new Map<string, TitleBase>();
    
    constructor(clanOptions: IClanOptions) {
        this.name = clanOptions.name || `clan${Clan.id++}`;
        this.leader = clanOptions.leader;
        this.introduction = clanOptions.introduction;
        this.coverUrl = clanOptions.coverUrl || defaultCoverUrl;
        this.avatarUrl = clanOptions.avatarUrl || defaultAvatarUrl;
        
        this.cacheBasicInfo();
    }
    
    /**
     * 获取缓存键
     */
    get cacheKey() {
        return {
            info: `clan: ${this.name}:info`,
            members: `clan: ${this.name}:members`,
            admins: `clan: ${this.name}:admins`,
            contests: `clan: ${this.name}:contests`,
            teams: `clan: ${this.name}:teams`,
            honors: `clan: ${this.name}:honors`
        };
    }
    
    /**
     * 缓存基本信息
     */
    async cacheBasicInfo() {
        const basicInfo = {
            name: this.name,
            leader: this.leader,
            introduction: this.introduction,
            coverUrl: this.coverUrl,
            avatarUrl: this.avatarUrl
        };
        
        await RedisCacheManager.set(this.cacheKey.info, basicInfo, 3600); // 1小时
        this.cacheMembers();
        this.cacheAdmins();
        this.cacheContests();
        this.cacheTeams();
        this.cacheHonors();
    }
    
    /**
     * 缓存成员
     */
    async cacheMembers() {
        const membersArray = Array.from(this._members.values());
        await RedisCacheManager.set(this.cacheKey.members, membersArray, 300); // 5分钟
    }
    
    /**
     * 缓存管理员
     */
    async cacheAdmins() {
        const adminsArray = Array.from(this._admin.values());
        await RedisCacheManager.set(this.cacheKey.admins, adminsArray, 300); // 5分钟
    }
    
    /**
     * 缓存比赛
     */
    async cacheContests() {
        const contestsArray = Array.from(this._contests.values());
        await RedisCacheManager.set(this.cacheKey.contests, contestsArray, 300); // 5分钟
    }
    
    /**
     * 缓存队伍
     */
    async cacheTeams() {
        await RedisCacheManager.set(this.cacheKey.teams, this._teams, 300); // 5分钟
    }
    
    /**
     * 缓存荣誉
     */
    async cacheHonors() {
        const honorsArray = Array.from(this._honors.values());
        await RedisCacheManager.set(this.cacheKey.honors, honorsArray, 3600); // 1小时
    }
    
    /**
     * 添加成员
     */
    addMember(member: string[] | string) {
        if (typeof member === "string") {
            member = [member];
        }
        
        member.forEach((m) => {
            const clanMember = new ClanMember({
                nickname: m,
                role: "member"
            });
            
            this._members.set(m, clanMember);
        });
        
        this.cacheMembers();
    }
    
    /**
     * 检查成员是否存在
     */
    hasMember(nickname: string): boolean {
        return this._members.has(nickname);
    }
    
    /**
     * 获取成员
     */
    getMember(nickname: string): ClanMember | undefined {
        return this._members.get(nickname);
    }
    
    /**
     * 检查是否为管理员
     */
    isAdmin(nickname: string): boolean {
        return this._admin.has(nickname);
    }
    
    /**
     * 获取所有成员
     */
    get members() {
        return [...this._members.values()];
    }
    
    /**
     * 删除成员
     */
    removeMember(nickname: string) {
        this._members.delete(nickname);
        this.cacheMembers();
        
        if (this._admin.has(nickname)) {
            this._admin.delete(nickname);
            this.cacheAdmins();
        }
    }
    
    /**
     * 添加管理员
     */
    addAdmin(nickname: string) {
        const member = this._members.get(nickname);
        if (member) {
            this._admin.set(nickname, member);
            this.cacheAdmins();
        }
    }
    
    /**
     * 获取管理员列表
     */
    get admins() {
        return [...this._admin.values()];
    }
    
    /**
     * 更新基本信息
     */
    updateInfo(info: Partial<IClanOptions>) {
        if (info.name) this.name = info.name;
        if (info.introduction) this.introduction = info.introduction;
        if (info.coverUrl) this.coverUrl = info.coverUrl;
        if (info.avatarUrl) this.avatarUrl = info.avatarUrl;
        
        this.cacheBasicInfo();
    }
    
    /**
     * 获取荣誉列表
     */
    get honors() {
        return [...this._honors.values()];
    }
    
    /**
     * 根据状态获取荣誉
     */
    getHonorsByStatus(status: TitleStatusType): TitleBase[] {
        return this.honors.filter((honor) => honor.status === status);
    }
    
    /**
     * 刷新荣誉状态
     */
    async refreshHonorStatuses(): Promise<void> {
        let updated = false;
        
        for (const honor of this._honors.values()) {
            const titleConfig = titleLibrary.get(honor.id);
            if (titleConfig) {
                // 这里可以添加荣誉状态刷新逻辑
                updated = true;
            }
        }
        
        if (updated) {
            this.cacheHonors();
        }
    }
    
    /**
     * 添加荣誉
     */
    async addHonors(honorIds: string[]): Promise<void> {
        for (const honorId of honorIds) {
            const titleConfig = titleLibrary.get(honorId);
            if (titleConfig) {
                this._honors.set(honorId, {
                    id: honorId,
                    name: titleConfig.name,
                    description: titleConfig.description,
                    icon: titleConfig.icon,
                    status: TitleStatus.ACTIVE,
                    createdAt: new Date()
                } as TitleBase);
            }
        }
        
        this.cacheHonors();
    }
    
    /**
     * 清除所有荣誉
     */
    async clearHonors(): Promise<void> {
        this._honors.clear();
        this.cacheHonors();
    }
    
    /**
     * 获取荣誉数量
     */
    get honorCount(): number {
        return this._honors.size;
    }
    
    /**
     * 检查是否拥有特定荣誉
     */
    hasHonor(honorId: string): boolean {
        return this._honors.has(honorId);
    }
    
    /**
     * 获取数据
     */
    get data() {
        return {
            name: this.name,
            leader: this.leader,
            introduction: this.introduction,
            coverUrl: this.coverUrl,
            avatarUrl: this.avatarUrl,
            memberCount: this._members.size,
            adminCount: this._admin.size,
            contestCount: this._contests.size,
            honorCount: this._honors.size,
            members: this.members,
            admins: this.admins,
            honors: this.honors,
            contests: [...this._contests.values()],
            teams: this._teams
        };
    }
    
    /**
     * 添加比赛记录
     */
    addContestRecord(contest: any) {
        this._contests.set(contest.id, contest);
        this.cacheContests();
    }
    
    /**
     * 处理比赛结果
     */
    processContestResult(records: any) {
        const members = this.members;
        members.forEach((member) => {
            this.getMember(member.nickName)?.addExp(10);
        });
        
        for (const record of Object.values(records)) {
            // 这里可以添加比赛结果处理逻辑
        }
    }
}