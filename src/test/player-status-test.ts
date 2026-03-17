// 测试选手当天状态的二进制表示
import ContestDay, { PlayerDayStatus } from "../models/contest/data/ContestDay";

/**
 * 测试选手当天状态的二进制表示
 */
async function testPlayerStatusBinary(): Promise<void> {
    try {
        console.log("=== 测试选手当天状态的二进制表示 ===");
        
        // 1. 生成选手状态
        console.log("1. 生成选手状态:");
        
        // 选手已进群、已签到、已进房、已完成游戏
        const fullStatus = ContestDay.generatePlayerStatus(true, true, true, true);
        console.log(`   已进群 + 已签到 + 已进房 + 已完成游戏: ${fullStatus} (二进制: ${fullStatus.toString(2).padStart(4, "0")})`);
        
        // 选手已进群、已签到、已进房、未完成游戏
        const preparationStatus = ContestDay.generatePlayerStatus(true, true, true, false);
        console.log(`   已进群 + 已签到 + 已进房 + 未完成游戏: ${preparationStatus} (二进制: ${preparationStatus.toString(2).padStart(4, "0")})`);
        
        // 选手未进群、未签到、未进房、未完成游戏
        const noneStatus = ContestDay.generatePlayerStatus(false, false, false, false);
        console.log(`   未进群 + 未签到 + 未进房 + 未完成游戏: ${noneStatus} (二进制: ${noneStatus.toString(2).padStart(4, "0")})`);
        
        // 2. 解析选手状态
        console.log("\n2. 解析选手状态:");
        
        const parsedStatus = ContestDay.parsePlayerStatus(fullStatus);
        console.log(`   状态值: ${parsedStatus.statusValue}`);
        console.log(`   二进制表示: ${parsedStatus.statusBinary}`);
        console.log(`   是否已进群: ${parsedStatus.isJoinedGroup}`);
        console.log(`   是否已签到: ${parsedStatus.isSignedIn}`);
        console.log(`   是否已进房: ${parsedStatus.isEnteredRoom}`);
        console.log(`   是否完成游戏: ${parsedStatus.isGameCompleted}`);
        
        // 3. 检查选手状态是否符合要求
        console.log("\n3. 检查选手状态是否符合要求:");
        
        // 检查选手是否已进群
        const hasJoinedGroup = ContestDay.checkPlayerStatus(fullStatus, PlayerDayStatus.JOINED_GROUP);
        console.log(`   是否已进群: ${hasJoinedGroup}`);
        
        // 检查选手是否已签到
        const hasSignedIn = ContestDay.checkPlayerStatus(fullStatus, PlayerDayStatus.SIGNED_IN);
        console.log(`   是否已签到: ${hasSignedIn}`);
        
        // 检查选手是否已进群和已签到
        const hasJoinedAndSigned = ContestDay.checkPlayerStatus(fullStatus, PlayerDayStatus.JOINED_AND_SIGNED);
        console.log(`   是否已进群和已签到: ${hasJoinedAndSigned}`);
        
        // 4. 更新选手状态
        console.log("\n4. 更新选手状态:");
        
        // 选手初始状态：已进群
        let currentStatus = PlayerDayStatus.JOINED_GROUP;
        console.log(`   初始状态: ${currentStatus} (二进制: ${currentStatus.toString(2).padStart(4, "0")})`);
        
        // 更新状态：添加已签到
        currentStatus = ContestDay.updatePlayerStatus(currentStatus, PlayerDayStatus.SIGNED_IN);
        console.log(`   添加已签到后: ${currentStatus} (二进制: ${currentStatus.toString(2).padStart(4, "0")})`);
        
        // 更新状态：添加已进房
        currentStatus = ContestDay.updatePlayerStatus(currentStatus, PlayerDayStatus.ENTERED_ROOM);
        console.log(`   添加已进房后: ${currentStatus} (二进制: ${currentStatus.toString(2).padStart(4, "0")})`);
        
        // 5. 移除选手状态
        console.log("\n5. 移除选手状态:");
        
        // 移除已签到状态
        currentStatus = ContestDay.removePlayerStatus(currentStatus, PlayerDayStatus.SIGNED_IN);
        console.log(`   移除已签到后: ${currentStatus} (二进制: ${currentStatus.toString(2).padStart(4, "0")})`);
        
        // 6. 演示不同选手状态的二进制表示
        console.log("\n6. 不同选手状态的二进制表示:");
        
        const statusExamples: Array<{
            description: string;
            isJoinedGroup: boolean;
            isSignedIn: boolean;
            isEnteredRoom: boolean;
            isGameCompleted: boolean;
        }> = [
            {
                description: "选手A：未进群、未签到、未进房、未完成游戏",
                isJoinedGroup: false,
                isSignedIn: false,
                isEnteredRoom: false,
                isGameCompleted: false
            },
            {
                description: "选手B：已进群、未签到、未进房、未完成游戏",
                isJoinedGroup: true,
                isSignedIn: false,
                isEnteredRoom: false,
                isGameCompleted: false
            },
            {
                description: "选手C：已进群、已签到、未进房、未完成游戏",
                isJoinedGroup: true,
                isSignedIn: true,
                isEnteredRoom: false,
                isGameCompleted: false
            },
            {
                description: "选手D：已进群、已签到、已进房、未完成游戏",
                isJoinedGroup: true,
                isSignedIn: true,
                isEnteredRoom: true,
                isGameCompleted: false
            },
            {
                description: "选手E：已进群、已签到、已进房、已完成游戏",
                isJoinedGroup: true,
                isSignedIn: true,
                isEnteredRoom: true,
                isGameCompleted: true
            },
            {
                description: "选手F：已进群、未签到、已进房、已完成游戏",
                isJoinedGroup: true,
                isSignedIn: false,
                isEnteredRoom: true,
                isGameCompleted: true
            }
        ];
        
        statusExamples.forEach((example, index) => {
            const status = ContestDay.generatePlayerStatus(
                example.isJoinedGroup,
                example.isSignedIn,
                example.isEnteredRoom,
                example.isGameCompleted
            );
            const parsed = ContestDay.parsePlayerStatus(status);
            console.log(`\n   ${index + 1}. ${example.description}`);
            console.log(`      状态值: ${status}`);
            console.log(`      二进制: ${parsed.statusBinary}`);
            console.log(`      详细状态: 进群=${parsed.isJoinedGroup}, 签到=${parsed.isSignedIn}, 进房=${parsed.isEnteredRoom}, 完成游戏=${parsed.isGameCompleted}`);
        });
        
        console.log("\n=== 测试完成 ===");
    } catch (error) {
        console.error("测试选手当天状态的二进制表示失败:", error);
    }
}

// 运行测试
testPlayerStatusBinary();