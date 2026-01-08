// 测试比赛状态计算功能
import ContestAutoStatusUpdateService from "../models/contest/services/ContestAutoStatusUpdateService";
import { MatchInfo } from "../models/contest/types/contest-schedule-types";

/**
 * 测试比赛状态计算功能
 */
async function testMatchStatusCalculation(): Promise<void> {
    try {
        console.log("=== 测试比赛状态计算功能 ===");
        
        // 获取当前日期
        const now = new Date();
        const currentDate = now.toISOString().split("T")[0];
        
        // 创建测试用的比赛数据
        const testMatches: Array<{ match: MatchInfo; date: string; description: string }> = [
            {
                match: {
                    matchId: "test_match_1",
                    time: "10:00",
                    requiredPlayers: 10,
                    status: "scheduled",
                    room: "Room1",
                    version: "经典版"
                },
                date: currentDate,
                description: "今天的比赛，时间已过"
            },
            {
                match: {
                    matchId: "test_match_2",
                    time: "23:00",
                    requiredPlayers: 10,
                    status: "scheduled",
                    room: "Room2",
                    version: "经典版"
                },
                date: currentDate,
                description: "今天的比赛，时间未到"
            },
            {
                match: {
                    matchId: "test_match_3",
                    time: "14:00",
                    requiredPlayers: 10,
                    status: "scheduled",
                    room: "Room3",
                    version: "经典版"
                },
                date: "2025-12-30",
                description: "明天的比赛"
            },
            {
                match: {
                    matchId: "test_match_4",
                    time: "14:00",
                    requiredPlayers: 10,
                    status: "scheduled",
                    room: "Room4",
                    version: "经典版"
                },
                date: "2025-12-28",
                description: "昨天的比赛"
            }
        ];
        
        // 测试每个比赛的状态计算
        for (const testCase of testMatches) {
            const status = ContestAutoStatusUpdateService.calculateMatchStatus(testCase.match, testCase.date, now);
            console.log(`${testCase.description}:`);
            console.log(`  日期: ${testCase.date}`);
            console.log(`  时间: ${testCase.match.time}`);
            console.log(`  计算出的状态: ${status}`);
            console.log();
        }
        
        console.log("=== 测试完成 ===");
    } catch (error) {
        console.error("测试比赛状态计算功能失败:", error);
    }
}

// 运行测试
testMatchStatusCalculation();