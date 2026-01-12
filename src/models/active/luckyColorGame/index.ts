import LuckyColorBox from "./boxs";

export default class LuckyColorGame {
    static colorMap = new Map<number, number>([
        [1, 100],
        [2, 80],
        [3, 60],
        [4, 40],
        [5, 20],
        [6, 10],
        [7, 5]
    ]);
    
    private _box: LuckyColorBox;
    private _result = 0;
    public boxNum = 0;
    
    constructor(readonly luckyColor: number) {
        this._box = new LuckyColorBox();
        this.boxNum = 9;
        this.initColorMap();
    }
    
    get box(): LuckyColorBox {
        return this._box;
    }
    
    get result(): number {
        return this._result;
    }
    
    /**
     * 初始化颜色概率映射
     */
    private initColorMap(): void {
        const total = 100;
        const colorLen = LuckyColorGame.colorMap.size;
        const eachValue = Number((total / colorLen).toFixed(2));
        
        for (let i = 1; i <= colorLen; i++) {
            LuckyColorGame.colorMap.set(i, eachValue);
        }
    }
    
    /**
     * 获取一个颜色对应的数值
     */
    getOneColorOfNumber(): number {
        const random = Math.random() * 100;
        let accumulated = 0;
        
        for (const [color, value] of LuckyColorGame.colorMap.entries()) {
            accumulated += value;
            if (random <= accumulated) {
                return color;
            }
        }
        
        return Math.min(9, Number((random / 11.11).toFixed(0) + 1));
    }
    
    /**
     * 开始游戏
     */
    public async start(): Promise<void> {
        this.box.clean();
        
        const fillNum = this.box.fill(() => this.getOneColorOfNumber(), this.boxNum);
        this.boxNum -= fillNum;
        
        this.box.start(this.luckyColor);
        this._result += fillNum;
    }
    
    /**
     * 增加游戏次数
     */
    public pay(num: number): void {
        if (num <= 0) {
            throw new Error("次数必须大于0");
        }
        this.boxNum += num;
    }
}