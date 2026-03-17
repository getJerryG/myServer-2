// 获取特定颜色在盒子中的数量
function getColorCount(color: number, boxs: number[]): number {
    return boxs.filter((e) => e === color).length;
}

// 获取水平方向计数
function getCountisHorizontal(boxs: number[]): number {
    let count = 0;
    for (let i = 0; i < 9; i++) {
        const e = boxs[i];
        if (e !== undefined) {
            count++;
        }
    }
    return count;
}

// 获取垂直方向计数
function getCountisVertical(boxs: number[]): number {
    let count = 0;
    for (let i = 0; i < 9; i++) {
        const e = boxs[i];
        if (e !== undefined) {
            count++;
        }
    }
    return count;
}

// 获取对角线方向计数
function getCountisDiagonal(boxs: number[]): number {
    let count = 0;
    for (let i = 0; i < 9; i++) {
        const e = boxs[i];
        if (e !== undefined) {
            count++;
        }
    }
    return count;
}

export default class LuckyColorBox {
    public status: "free" | "pending" | "fulfilled" | "rejected";
    public count = 0;
    private _data: (number | undefined)[];
    private _length = 9;
    private _log: unknown[];
    
    constructor() {
        this._data = Array.from({ length: this._length }, () => undefined);
        this.status = "free";
        this._log = [];
    }
    
    get data(): (number | undefined)[] {
        return this._data;
    }
    
    /**
     * 填充颜色到盒子中
     */
    fill(color: () => number, num: number = this._length): number {
        if (this.status !== "free") {
            throw new Error("盒子当前不可用");
        }
        
        let count = 0;
        for (let i = 0; i < this._length; i++) {
            if (count >= num) {
                break;
            }
            
            const e = this._data[i];
            if (e !== undefined) {
                continue;
            }
            
            this._data[i] = color();
            count++;
        }
        
        return count;
    }
    
    /**
     * 清空盒子
     */
    clean(): void {
        this._data = Array.from({ length: this._length }, () => undefined);
    }
    
    /**
     * 获取随机颜色
     */
    private getRandomColor(): number {
        return Math.floor(Math.random() * 7) + 1;
    }
    
    /**
     * 获取日志
     */
    get log(): unknown[] {
        return this._log;
    }
    
    /**
     * 开始游戏
     */
    start(luckyColor: number): void {
        if (this.status !== "free") {
            throw new Error("盒子当前不可用");
        }
        
        this.status = "pending";
        
        // 计算各种颜色和方向的计数
        this.count += getColorCount(luckyColor, this._data); // 特定颜色计数
        this.count += getColorCount(0, this._data); // 0的计数
        this.count += getCountisHorizontal(this._data); // 水平计数
        this.count += getCountisVertical(this._data); // 垂直计数
        this.count += getCountisDiagonal(this._data); // 对角线计数
        
        // 运行到颜色
        this.runToColor();
        
        this.status = "fulfilled";
    }
    
    /**
     * 运行到颜色
     */
    private runToColor(): void {
        for (let i = 0; i < this._length; i++) {
            const e = this._data[i];
            if (e === undefined) {
                continue;
            }
            // 这里可以添加运行到颜色的逻辑
        }
    }
}