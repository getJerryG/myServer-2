type weekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;
class Edition {
    name: string;
    openDay: weekDay[];
    constructor(name: string = "标准场", openDay: weekDay[] = [1, 2, 3, 4, 5, 6, 7]) {
        this.name = name;
        this.openDay = openDay;
    }
};

const option: { name: string; openDay?: weekDay[] }[] = [
    {
        name: "标准场",
    },
    {
        name: "赤月猎魔人",
        openDay: [6, 7],
    },
    {
        name: "白狼王守卫"
    },
    {
        name: "狼美人骑士"
    },
    {
        name: "石像鬼守墓人"
    },
    {
        name: "永序之轮"
    },
    {
        name: "狼王守卫"
    },
    {
        name: "狼王猎魔人"
    },
    {
        name: "纯白夜影"
    },
    {
        name: "镜影迷踪"
    },
    {
        name: "觉醒石像鬼"
    },
];


export default new Map(option.map((item) => [item.name, new Edition(item.name, item.openDay)]));
