import CountDown from "./countDown";

class CountDownManager {
    static countDowns = new Map<string, CountDown>();
    
    constructor() {
        // 构造函数逻辑
    }
    
    /**
     * 创建倒计时
     * @param time 倒计时时间
     * @param callback 回调函数
     * @returns 倒计时ID
     */
    static create(time: number, callback: () => void): string {
        const countDown = new CountDown(time, callback);
        const id = `countdown_${Date.now()}`;
        this.countDowns.set(id, countDown);
        return id;
    }
    
    /**
     * 启动倒计时
     * @param id 倒计时ID
     */
    static start(id: string): void {
        const countDown = this.countDowns.get(id);
        if (countDown) {
            countDown.start();
        }
    }
    
    /**
     * 暂停倒计时
     * @param id 倒计时ID
     */
    static pause(id: string): void {
        const countDown = this.countDowns.get(id);
        if (countDown) {
            countDown.pause();
        }
    }
    
    /**
     * 恢复倒计时
     * @param id 倒计时ID
     */
    static resume(id: string): void {
        const countDown = this.countDowns.get(id);
        if (countDown) {
            countDown.resume();
        }
    }
    
    /**
     * 停止倒计时
     * @param id 倒计时ID
     */
    static stop(id: string): void {
        const countDown = this.countDowns.get(id);
        if (countDown) {
            countDown.stop();
            this.countDowns.delete(id);
        }
    }
    
    /**
     * 获取倒计时
     * @param id 倒计时ID
     * @returns 倒计时实例
     */
    static get(id: string): CountDown | undefined {
        return this.countDowns.get(id);
    }
}

export default CountDownManager;