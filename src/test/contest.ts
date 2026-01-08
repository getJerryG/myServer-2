// 测试赛事测试
import { ContestService } from "../models/contest";
import { IContest } from "../models/contest/types/contest";
import { IContestSchedule } from "../models/contest/types/contest";
import ContestTeamRegistrationService from "../models/contest/services/ContestTeamRegistrationService";
import ContestScheduleService from "../models/contest/services/ContestScheduleService";


/**
 * 主测试函数，按顺序执行所有测试步骤
 */
async function runTest(): Promise<void> {
    try {
        // 1. 创建赛事
        const createdContest = await createContest();
        if (!createdContest) return;

        // 2. 查询赛事
        const contest = await getContestInfo("比赛A");
        if (!contest) return;

        // 3. 创建或获取赛程
        const schedule = await createOrGetSchedule(contest);

        // 4. 向赛程中添加比赛
        await addMatchesToSchedule(schedule);

        // 5. 获取赛程（所有赛程）
        await displayAllSchedules(contest);

        // 6. 获取今日赛程
        await getTodaySchedule(contest);

        // 7. 显示当前报名队伍信息
        await displayTeamsInfo(contest);

        // 8. 获取今天流程
        await getTodayFlow();

        // 9. 显示今天的比赛信息
        await getTodayMatchInfo(contest);

        console.log("\n测试完成！");

    } catch (error) {
        console.error("测试过程中发生错误:", error);
    }
}

// 5秒后开始执行测试
setTimeout(runTest, 5000);


/**
 * 创建赛事
 * @returns 创建的赛事信息或null
 */
async function createContest(): Promise<IContest | null> {
    console.log("1. 创建赛事...");

    // 检查是否已存在同名赛事
    const existingContest = await ContestService.getContestByName("比赛A");
    if (existingContest) {
        console.log("赛事已存在，直接使用现有赛事");
        return existingContest;
    }

    // 创建新赛事
    const newContest = await ContestService.createContest({
        name: "比赛A",
        type: "",
        rule: "",
        startDay: new Date(),
        endDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contestIntroduction: "测试赛事",
        maxSignTeams: 32,
        creatorId: "admin",
        creatorName: "管理员",
        registrationType: ""
    });

    if (newContest) {
        console.log("成功创建赛事:", newContest.name);
        return newContest;
    } else {
        console.log("创建赛事失败");
        return null;
    }
}

/**
 * 获取赛事信息
 * @param contestName 赛事名称
 * @returns 赛事信息或null
 */
async function getContestInfo(contestName: string = "比赛A"): Promise<IContest | null> {
    console.log(`\n2. 获取赛事信息 - ${contestName}...`);
    const contest = await ContestService.getContestByName(contestName);
    if (!contest) {
        console.log("未找到指定赛事");
        return null;
    }
    return contest;
}

/**
 * 获取今天流程
 */
async function getTodayFlow(): Promise<void> {
    console.log("\n7. 获取今天流程...");
    const todayFlow = await ContestScheduleService.getTodayFlow();
    console.log("今天的流程安排:");
    console.log("| 时间 | 流程 | 说明 |");
    console.log("|------|------|------|");
    todayFlow.forEach(item => {
        console.log(`| ${item.time} | ${item.flow} | ${item.description} |`);
    });
}

/**
 * 显示今天的比赛信息
 * @param contest 赛事信息
 */
async function getTodayMatchInfo(contest: IContest): Promise<void> {
    console.log("\n8. 获取今天的比赛信息...");
    const todayDate = new Date().toISOString().split("T")[0];

    // 获取赛事所有赛程
    const schedules = await ContestScheduleService.getScheduleByContestId(contest.contestId);

    let hasTodayMatches = false;
    schedules.forEach(schedule => {
        // 查找今天的赛程安排
        const todaySchedule = schedule.schedule.find(daily => daily.date === todayDate);
        if (todaySchedule && todaySchedule.matches.length > 0) {
            hasTodayMatches = true;
            console.log(`\n轮次: ${schedule.roundName} (${schedule.roundOrder})`);
            console.log(`今天 ${todayDate} 的比赛信息:`);
            todaySchedule.matches.forEach((match, matchIndex) => {
                console.log(`  ${matchIndex + 1}. 时间: ${match.time}, 状态: ${match.status}, 房间: ${match.room}, 所需人数: ${match.requiredPlayers}`);
            });
        }
    });

    if (!hasTodayMatches) {
        console.log(`今天 ${todayDate} 没有比赛安排`);
    }
}

/**
 * 创建或获取赛程
 * @param contest 赛事信息
 * @returns 赛程信息
 */
async function createOrGetSchedule(contest: IContest): Promise<IContestSchedule> {
    console.log("\n3. 为赛事创建赛程...");

    // 打印赛事时间信息
    console.log("赛事开始时间:", contest.startDay);
    console.log("赛事结束时间:", contest.endDay);

    // 尝试获取现有赛程
    let schedule = await ContestScheduleService.getScheduleByRoundOrder(contest.contestId, 1);

    if (!schedule) {
        // 如果赛程不存在，创建新赛程
        schedule = await ContestScheduleService.createSchedule(
            contest.contestId.toString(), // 赛事ID
            {
                roundName: "初赛",
                roundOrder: 1,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                participatingTeamsCount: 16,
                promotedTeamsCount: 8,
                eliminationInfo: {
                    mode: "ratio",// 淘汰模式：按比例淘汰
                    ratio: 0.5,
                    baseMultiple: 2,
                    description: "淘汰一半队伍"
                },
                schedule: [] // 初始为空，后续可以添加每天的赛程
            },
            { autoUpdateContestTime: true } // 添加此选项，当赛程时间超出赛事时间时自动更新赛事时间
        );
        console.log("成功创建赛程:");
    } else {
        console.log("赛程已存在，直接使用现有赛程:");
    }

    console.log(`赛程ID: ${schedule._id}`);
    console.log(`轮次: ${schedule.roundOrder} (${schedule.roundName})`);
    return schedule;
}

/**
 * 向赛程中添加比赛
 * @param schedule 赛程信息
 */
async function addMatchesToSchedule(schedule: IContestSchedule): Promise<void> {
    // 检查每天的赛程是否已经存在比赛，如果不存在则添加
    const datesToCheck = ["2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30"];
    for (let i = 0; i < datesToCheck.length; i++) {
        const date = datesToCheck[i];
        const room = `Room${i + 1}`;

        // 获取当天的赛程
        const dailySchedule = schedule.schedule.find((item) => item.date === date);

        // 如果当天没有赛程或者当天没有比赛，添加一个比赛
        if (!dailySchedule || dailySchedule.matches.length === 0) {
            await ContestScheduleService.addMatchToSchedule(
                schedule._id.toString(), // 赛程ID
                date, // 日期
                {
                    time: "19:00",
                    requiredPlayers: 10,
                    status: "scheduled",// 比赛状态：已计划
                    room: room,
                    edition: "标准场" // 添加版型信息
                }
            );
            console.log(`已为${date}添加比赛，房间: ${room}`);
        } else {
            console.log(`${date}已有${dailySchedule.matches.length}场比赛，跳过添加`);
        }
    }

    // 4. 向赛程中添加不同版型的比赛，测试版型验证功能
    console.log("\n4. 向赛程中添加不同版型的比赛，测试版型验证功能...");

    // 测试1: 在周六（2025-12-27）添加赤月猎魔人版型（应该成功，因为赤月猎魔人在周六开放）
    try {
        await ContestScheduleService.addMatchToSchedule(
            schedule._id.toString(),
            "2025-12-27", // 周六
            {
                time: "14:00",
                requiredPlayers: 10,
                status: "scheduled",
                room: "Room2",
                edition: "赤月猎魔人" // 赤月猎魔人在周六开放
            }
        );
        console.log("✓ 测试1成功: 在周六添加赤月猎魔人版型比赛成功");
    } catch (error) {
        console.error("✗ 测试1失败: 在周六添加赤月猎魔人版型比赛失败:", error);
    }

    // 测试2: 在周一（2025-12-29）添加赤月猎魔人版型（应该失败，因为赤月猎魔人只在周六日开放）
    try {
        await ContestScheduleService.addMatchToSchedule(
            schedule._id.toString(),
            "2025-12-29", // 周一
            {
                time: "14:00",
                requiredPlayers: 10,
                status: "scheduled",
                room: "Room3",
                edition: "赤月猎魔人" // 赤月猎魔人在周一不开放
            }
        );
        console.error("✗ 测试2失败: 在周一添加赤月猎魔人版型比赛应该失败，但成功了");
    } catch (error) {
        console.log("✓ 测试2成功: 在周一添加赤月猎魔人版型比赛失败，符合预期:", (error as Error).message);
    }

    // 测试3: 添加不存在的版型（应该失败）
    try {
        await ContestScheduleService.addMatchToSchedule(
            schedule._id.toString(),
            "2025-12-28", // 周日
            {
                time: "15:00",
                requiredPlayers: 10,
                status: "scheduled",
                room: "Room4",
                edition: "不存在的版型" // 不存在的版型
            }
        );
        console.error("✗ 测试3失败: 添加不存在的版型应该失败，但成功了");
    } catch (error) {
        console.log("✓ 测试3成功: 添加不存在的版型比赛失败，符合预期:", (error as Error).message);
    }

    // 测试4: 在周日（2025-12-28）添加赤月猎魔人版型（应该成功）
    try {
        const updatedSchedule = await ContestScheduleService.addMatchToSchedule(
            schedule._id.toString(),
            "2025-12-28", // 周日
            {
                time: "16:00",
                requiredPlayers: 10,
                status: "scheduled",
                room: "Room5",
                edition: "赤月猎魔人" // 赤月猎魔人在周日开放
            }
        );
        console.log("✓ 测试4成功: 在周日添加赤月猎魔人版型比赛成功");
        console.log(`更新后的赛程包含 ${updatedSchedule?.schedule.length} 天的赛程`);
    } catch (error) {
        console.error("✗ 测试4失败: 在周日添加赤月猎魔人版型比赛失败:", error);
    }

    // 测试5: 更新比赛版型为不开放的版型（应该失败）
    try {
        // 先获取一个比赛的matchId
        const schedules = await ContestScheduleService.getScheduleByContestId(schedule.contest_id);
        const firstSchedule = schedules[0];
        const firstDailySchedule = firstSchedule.schedule[0];
        const firstMatch = firstDailySchedule.matches[0];

        await ContestScheduleService.updateMatchInfo(
            firstSchedule._id.toString(),
            firstDailySchedule.date, // 使用第一个比赛的日期（假设是2025-12-26，星期四）
            firstMatch.matchId,
            {
                edition: "赤月猎魔人" // 赤月猎魔人只在周六日开放，周四不开放
            }
        );
        console.error("✗ 测试5失败: 更新比赛版型为不开放的版型应该失败，但成功了");
    } catch (error) {
        console.log("✓ 测试5成功: 更新比赛版型为不开放的版型失败，符合预期:", (error as Error).message);
    }

    // 测试6: 更新比赛版型为开放的版型（应该成功）
    try {
        // 先获取一个比赛的matchId
        const schedules = await ContestScheduleService.getScheduleByContestId(schedule.contest_id);
        const firstSchedule = schedules[0];
        // 找到周六的赛程（2025-12-27）
        const saturdaySchedule = firstSchedule.schedule.find(daily => daily.date === "2025-12-27");
        if (!saturdaySchedule) {
            console.error("✗ 测试6失败: 未找到周六的赛程");
        } else {
            const firstMatch = saturdaySchedule.matches[0];

            await ContestScheduleService.updateMatchInfo(
                firstSchedule._id.toString(),
                saturdaySchedule.date, // 周六
                firstMatch.matchId,
                {
                    edition: "赤月猎魔人" // 赤月猎魔人在周六开放
                }
            );
            console.log("✓ 测试6成功: 更新比赛版型为开放的版型成功");
        }
    } catch (error) {
        console.error("✗ 测试6失败: 更新比赛版型为开放的版型失败:", error);
    }
}

/**
 * 获取并显示今天的赛程
 * @param contest 赛事信息
 */
async function getTodaySchedule(contest: IContest): Promise<void> {
    console.log("\n5. 获取更新后的赛程信息...");
    const schedules = await ContestScheduleService.getScheduleByContestId(contest.contestId);

    if (schedules.length > 0) {
        // 使用第一个赛程的ID来获取今天的赛程
        const todayDate = new Date().toISOString().split("T")[0];
        const todaySchedules = await ContestScheduleService.getScheduleByDate(schedules[0]._id.toString(), todayDate);
        console.log(`\n今天 ${todayDate} 的赛程:`);
        console.log(todaySchedules);
    }
}

/**
 * 显示所有赛程信息
 * @param contest 赛事信息
 */
async function displayAllSchedules(contest: IContest): Promise<void> {
    const schedules = await ContestScheduleService.getScheduleByContestId(contest.contestId);

    if (schedules.length === 0) {
        console.log("该赛事暂无赛程信息");
        return;
    }

    console.log(`共找到 ${schedules.length} 个赛程:`);

    schedules.forEach((schedule, index) => {
        const { _id, roundOrder, roundName, startDate, endDate, participatingTeamsCount,
            schedule: dailySchedule
        } = schedule;
        console.log(`\n${index + 1}. 赛程ID: ${_id}`);
        console.log(`   轮次: ${roundOrder} (${roundName})`);
        console.log(`   开始时间: ${startDate}`);
        console.log(`   结束时间: ${endDate}`);
        console.log(`   参赛队伍数: ${participatingTeamsCount}`);
        console.log(`   包含 ${dailySchedule.length} 天的赛程安排`);

        // 打印每天的赛程概览
        dailySchedule.forEach(daily => {
            console.log(`     - ${daily.date}: ${daily.matches.length} 场比赛`);
            daily.matches.forEach((match, matchIndex) => {
                console.log(`       ${matchIndex + 1}. 时间: ${match.time}, 状态: ${match.status}, 房间: ${match.room}`);
            });
        });
    });
}

/**
 * 显示当前报名的队伍信息
 * @param contest 赛事信息
 */
async function displayTeamsInfo(contest: IContest): Promise<void> {
    console.log("\n6. 获取当前报名的队伍...");
    const teams = await ContestTeamRegistrationService.getRegistrationsByContestId(contest.contestId.toString());

    console.log("当前报名队伍详情:");
    console.log(`共 ${teams.length} 个队伍报名`);
    console.log(`currentSignTeams字段值: ${contest.currentSignTeams}`);
    console.log(`数据一致性: ${teams.length === contest.currentSignTeams ? "一致" : "不一致"}`);

    if (teams.length > 0) {
        teams.forEach((team, index) => {
            const { teamName, teamId, leaderId, clanId, registrationTime } = team;
            console.log(`\n${index + 1}. 队伍名称: ${teamName}`);
            console.log(`   队伍ID: ${teamId}`);
            console.log(`   队长ID: ${leaderId}`);
            console.log(`   所属家族ID: ${clanId}`);
            console.log(`   报名时间: ${registrationTime}`);
            console.log(`   存储的contestId: ${team.contest_id} (类型: ${typeof team.contest_id})`);
        });
    }
}
