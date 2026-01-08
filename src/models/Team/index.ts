import Clan from "../clan/Clan";
import RedisCacheManager from "../../utils/redisCache";

export interface PlayerAllocation {
    leader: number;
    officialMember: number;
    substitutes: number;
}

export interface TeamMember {
    nickName: string;
    openId?: string;
}

export interface PromotionRecord {
    contestId: string;
    contestName: string;
    stage: string;
    promotionStatus: "pending" | "promoted" | "eliminated";
    rank: number;
    updatedAt: Date;
}

export default class Team {
    id: number;
    name: string;
    leader: string;
    members: Map<TeamMember["nickName"], TeamMember>;
    clan: Clan;
    readonly memberOps: PlayerAllocation;
    records: Record<
        string,
        { startDay: string; endDay: string; any: any[]; schedule: any[] }
    >;
    promotionRecords: PromotionRecord[];
    contestId?: string;

    constructor(options: {
        id?: number;
        name: string;
        leader: string;
        memberOps?: PlayerAllocation;
        clan: Clan;
        contestId?: string;
    }) {
        this.id = options.id || 1;
        this.name = options.name;
        this.leader = options.leader;
        this.members = new Map();
        this.memberOps = options.memberOps || {
            leader: 1,
            officialMember: 6,
            substitutes: 3,
        };
        this.clan = options.clan;
        this.records = {};
        this.promotionRecords = [];
        this.contestId = options.contestId;

        this.cacheBasicInfo();
    }

    get cacheKey() {
        return {
            info: `team:${this.name}:info`,
            members: `team:${this.name}:members`,
            records: `team:${this.name}:records`,
            promotionRecords: `team:${this.name}:promotionRecords`,
        };
    }

    async cacheBasicInfo() {
        const basicInfo = {
            id: this.id,
            name: this.name,
            leader: this.leader,
            clan: this.clan.name,
            memberOps: this.memberOps,
            contestId: this.contestId,
        };
        await RedisCacheManager.set(this.cacheKey.info, basicInfo, 3600);
        this.cacheMembers();
    }

    async cacheMembers() {
        const membersArray = Array.from(this.members.values());
        await RedisCacheManager.set(this.cacheKey.members, membersArray, 300);
    }

    async cacheRecords() {
        await RedisCacheManager.set(this.cacheKey.records, this.records, 300);
    }

    async cachePromotionRecords() {
        await RedisCacheManager.set(
            this.cacheKey.promotionRecords,
            this.promotionRecords,
            3600
        );
    }

    get size() {
        return this.members.size;
    }

    has(nickName: TeamMember["nickName"]): boolean {
        if (!nickName) {
            return false;
        }
        return this.members.has(nickName);
    }

    get isEmpty() {
        return this.members.size === 0;
    }

    get isFull() {
        return this.size >= this.maxMember;
    }

    get maxMember() {
        return this.memberOps.officialMember + this.memberOps.substitutes;
    }

    join(player: TeamMember[] | TeamMember) {
        if (!player) {
            return;
        }
        if (!Array.isArray(player)) {
            player = [player];
        }
        const joinedPlayers = player.filter((p) => this.has(p.nickName));
        if (joinedPlayers.length > 0) {
            throw new Error(
                `${joinedPlayers.map((p) => p.nickName).join(", ")}已存在`
            );
        }
        const numberOfRemainingMembers = this.maxMember - this.size;
        const overflowPlayers = player.slice(numberOfRemainingMembers);
        if (overflowPlayers.length > 0) {
            throw new Error(
                `${overflowPlayers.map((p) => p.nickName).join(", ")}超出成员限制`
            );
        }
        const newPlayers = player.slice(0, numberOfRemainingMembers);

        newPlayers.forEach((p) => {
            this.members.set(p.nickName, p);
        });

        this.cacheMembers();
    }

    leave(player: TeamMember) {
        this.members.delete(player.nickName);
        this.cacheMembers();
    }

    someMember() {
        return [...this.members.values()].map((p) => p.nickName);
    }

    isOfficialMember(playerName: TeamMember["nickName"]): boolean {
        const index = this.someMember().findIndex((m) => m === playerName);
        return index !== -1 && index < this.memberOps.officialMember;
    }

    isSubstituteMember(playerName: TeamMember["nickName"]): boolean {
        const index = this.someMember().findIndex((m) => m === playerName);
        return index !== -1 && index >= this.memberOps.officialMember;
    }

    getRecord(date: string, _round: number) {
        const {records} = this;
        for (const record of Object.values(records)) {
            const arr = record.schedule;
            const match = arr.find((item) => item.date === date);
            if (match) {
                return match;
            }
        }
        return null;
    }

    setRecord(recordKey: string, recordData: any) {
        this.records[recordKey] = recordData;
        this.cacheRecords();
    }

    addPromotionRecord(record: PromotionRecord) {
        const existingIndex = this.promotionRecords.findIndex(
            (r) => r.contestId === record.contestId && r.stage === record.stage
        );
        if (existingIndex >= 0) {
            this.promotionRecords[existingIndex] = record;
        } else {
            this.promotionRecords.push(record);
        }
        this.cachePromotionRecords();
    }

    getPromotionRecordsByContest(contestId: string) {
        return this.promotionRecords.filter((r) => r.contestId === contestId);
    }

    getPromotionRecord(contestId: string, stage: string) {
        return this.promotionRecords.find(
            (r) => r.contestId === contestId && r.stage === stage
        );
    }

    getLatestPromotionRecord() {
        if (this.promotionRecords.length === 0) {
            return null;
        }
        return this.promotionRecords.sort(
            (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        )[0];
    }

    async clearCache() {
        await RedisCacheManager.delete(this.cacheKey.info);
        await RedisCacheManager.delete(this.cacheKey.members);
        await RedisCacheManager.delete(this.cacheKey.records);
        await RedisCacheManager.delete(this.cacheKey.promotionRecords);
    }

    destroy() {
        this.members.clear();
        this.promotionRecords = [];
        this.records = {};
        this.clearCache();
    }
}
