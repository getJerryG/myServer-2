import schedule from "node-schedule";

class CountDown {
    id: string;
    time: number;
    createDate: number;
    cb: () => void;
    private __status: "stop" | "running";
    job: schedule.Job | null;
    
    constructor(time: number, cb: () => void) {
        this.id = crypto.randomUUID();
        this.time = time;
        this.createDate = Date.now();
        this.cb = cb;
        this.__status = "stop";
        this.job = null;
    }
    
    /**
     * 启动倒计时
     */
    start(): void {
        if (this.__status === "running") return;
        
        this.__status = "running";
        this.job = schedule.scheduleJob(new Date(Date.now() + this.time), () => {
            this.__status = "stop";
            this.cb();
        });
    }
    
    /**
     * 暂停倒计时
     */
    pause(): void {
        if (this.__status === "stop" || !this.job) return;
        
        this.job.cancel();
        this.__status = "stop";
        this.job = null;
    }
    
    /**
     * 恢复倒计时
     */
    resume(): void {
        this.start();
    }
    
    /**
     * 停止倒计时
     */
    stop(): void {
        this.pause();
    }
    
    /**
     * 获取倒计时状态
     * @returns 倒计时状态
     */
    get status(): "stop" | "running" {
        return this.__status;
    }
}

export default CountDown;