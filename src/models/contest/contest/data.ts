import { ContestData } from "../data/contest";

// 竞赛数据定义

/** S1赛季 */
const contest1: ContestData = { name: "S1" ,
    type: "", // 竞赛类型
    contestIntroduction: `
        这是S1赛季的竞赛介绍
        详细描述竞赛规则和奖励
    `,
    contestReward: [ { item: 1  , reward: "1000" },
        { item: 2 , reward: "500" },
        { item: 3 , reward: "300" }
    ],
    contestSignUp: { registrationFee: 70 , 
        deposit: 50 
    },
    contestSchedule: [ { name: "小组赛"  ,
        startTime: new Date("2025-11-01 19:00"),
        endTime: new Date("2025-11-07 22:00")
    },
    { name: "淘汰赛" ,
        startTime: new Date("2025-11-08 19:00"),
        endTime: new Date("2025-11-14 22:00")
    },
    { name: "决赛" ,
        startTime: new Date("2025-11-15 19:00"),
        endTime: new Date("2025-11-15 22:00")
    }
    ]
};

// 导出竞赛数据
export default {
    contest1
};