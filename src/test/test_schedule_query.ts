// 专门测试赛程查询功能的脚本
import ContestScheduleService from "../models/contest/services/ContestScheduleService";
import { ContestService } from "../models/contest";

async function testScheduleQuery() {
    console.log("开始测试赛程查询功能...");
    
    try {
        // 1. 获取一个测试赛事
        console.log("1. 获取测试赛事...");
        const contest = await ContestService.getContestByName("比赛A");
        if (contest) {
            console.log("找到测试赛事:", contest.contestId);
            
            // 2. 测试根据比赛ID查询赛程
            console.log("\n2. 测试根据比赛ID查询赛程...");
            console.log("使用的比赛ID:", contest.contestId, "(类型:", typeof contest.contestId, ")");
            const schedules = await ContestScheduleService.getScheduleByContestId(contest.contestId);
            console.log(`查询到 ${schedules.length} 个赛程`);
            
            // 3. 打印赛程详情
            schedules.forEach((schedule, index) => {
                console.log(`\n赛程 ${index + 1}:`);
                console.log(`  赛程ID: ${schedule._id}`);
                console.log(`  比赛ID: ${schedule.contest_id}`);
                console.log(`  轮次名称: ${schedule.roundName}`);
                console.log(`  轮次顺序: ${schedule.roundOrder}`);
            });
        } else {
            console.log("未找到测试赛事，请先创建赛事");
        }
        
        console.log("\n测试完成！");
    } catch (error) {
        console.error("测试失败:", error);
    }
}

testScheduleQuery();