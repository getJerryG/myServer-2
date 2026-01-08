import Team from "../../../Team";
import { ContestRanking, RankingType } from "../types/contest-types";

/**
 * 排名管理器
 */
export class RankingManager {
    private ranking: ContestRanking[];
    private rankingType: RankingType;
    private rankingUpdatedAt: Date;

    /**
     * 构造函数
     */
    constructor() {
        this.ranking = [];
        this.rankingType = "auto";
        this.rankingUpdatedAt = new Date();
    }

    /**
     * 自动排名
     * @param signTeams 报名队伍集合
     * @returns 排名列表
     */
    autoRank(signTeams: Set<Team>): ContestRanking[] {
        const teamsWithStats = [...signTeams].map((team) => {
            let totalScore = 0;
            let mvpCount = 0;
            let svpCount = 0;
            let wolfWinCount = 0;
            let godWinCount = 0;
            let civilianWinCount = 0;

            // 计算队伍统计数据
            Object.values(team.records).forEach((roundRecord: Record<string, unknown>) => {
                (roundRecord.schedule as Array<Record<string, unknown>>).forEach((matchRecord) => {
                    totalScore += (matchRecord.score as number) || 0;

                    // 统计MVP/SVP次数
                    if (matchRecord.mvp) {
                        mvpCount++;
                    }
                    if (matchRecord.svp) {
                        svpCount++;
                    }

                    // 统计阵营胜利次数
                    if (matchRecord.faction === "wolf") {
                        wolfWinCount++;
                    } else if (matchRecord.faction === "god") {
                        godWinCount++;
                    } else if (matchRecord.faction === "civilian") {
                        civilianWinCount++;
                    }
                });
            });

            return {
                teamId: team.id, // 队伍ID
                teamName: team.name,
                clanId: team.clan.id,
                score: totalScore,
                mvpCount,
                svpCount,
                wolfWinCount,
                godWinCount,
                civilianWinCount,
                promotionStatus: "pending" as const
            };
        });

        // 排序规则：总分 > MVP次数 > SVP次数 > 狼人胜利次数 > 神牌胜利次数 > 平民胜利次数 > 队伍名称
        teamsWithStats.sort((a, b) => {
            // 1. 总分排序
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // 2. MVP次数排序
            if (b.mvpCount !== a.mvpCount) {
                return b.mvpCount - a.mvpCount;
            }
            // 3. SVP次数排序
            if (b.svpCount !== a.svpCount) {
                return b.svpCount - a.svpCount;
            }
            // 4. 狼人胜利次数排序
            if (b.wolfWinCount !== a.wolfWinCount) {
                return b.wolfWinCount - a.wolfWinCount;
            }
            // 5. 神牌胜利次数排序
            if (b.godWinCount !== a.godWinCount) {
                return b.godWinCount - a.godWinCount;
            }
            // 6. 平民胜利次数排序
            if (b.civilianWinCount !== a.civilianWinCount) {
                return b.civilianWinCount - a.civilianWinCount;
            }
            // 7. 队伍名称排序
            return a.teamName.localeCompare(b.teamName);
        });

        // 生成排名
        this.ranking = teamsWithStats.map((team, index) => ({
            ...team,
            rank: index + 1
        }));
        this.rankingType = "auto";
        this.rankingUpdatedAt = new Date();

        return this.ranking;
    }

    /**
     * 手动排名
     * @param rankingData 排名数据
     * @param teams 队伍集合
     * @param _operator 操作者
     */
    manualRank(rankingData: ContestRanking[], teams: Set<Team>, _operator: string): void {
        // 验证并补充排名数据
        const validatedRankingData = rankingData.map((rank) => {
            // 补充clanId
            const team = [...teams].find((t) => t.name === rank.teamName);
            if (team) {
                rank.clanId = team.clan.id;
            }
            return rank;
        });

        this.ranking = validatedRankingData;
        this.rankingType = "manual";
        this.rankingUpdatedAt = new Date();
    }

    /**
     * 获取排名列表
     * @returns 排名列表
     */
    getRanking(): ContestRanking[] {
        return this.ranking;
    }

    /**
     * 获取排名类型
     * @returns 排名类型
     */
    getRankingType(): RankingType {
        return this.rankingType;
    }

    /**
     * 获取排名更新时间
     * @returns 更新时间
     */
    getRankingUpdatedAt(): Date {
        return this.rankingUpdatedAt;
    }
}
