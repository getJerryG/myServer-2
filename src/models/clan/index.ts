import Clan from "./Clan";

// 创建测试 clan
const clan1 = new Clan({
    name: "TestClan",
    leader: "QAQ",
    introduction: "This is a test clan"
});

clan1.addMember(["QAQ", "TT", "Member1", "Member2", "Member3"]);

class ClanManager {
    static clans = new Map<string, Clan>();
    
    /**
     * 添加 clan
     */
    static addClan(clan: Clan) {
        this.clans.set(clan.name, clan);
    }
    
    /**
     * 获取 clan
     */
    static getClan(clanName: string): Clan | undefined {
        return this.clans.get(clanName);
    }
}

// 添加测试 clan 到管理器
ClanManager.addClan(clan1);

export default ClanManager;