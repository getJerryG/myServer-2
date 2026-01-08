import EventEmitter from "events";
import WorkerHandler from "./WorkerHandler";

/**
 * 线程池类
 * @extends EventEmitter
 */
export default class ThreadPool extends EventEmitter {
    private static instance: ThreadPool;
    private workers: WorkerHandler[] = [];
    private taskQueue: { id: string;
        handler: string;
        data: unknown;
        retries: number;
        timeout: number;
        status: "pending" | "running" | "completed" | "failed";
     }[] = [];
    private maxThreads: number;
    private results: Record<string, { 
        resolve: (value: unknown) => void;
        reject: (reason?: Error) => void;
     }> = {};

    /**
     * 构造函数
     * @param maxThreads 最大线程数，默认使用CPU核心数
     */
    private constructor(maxThreads?: number) {
        super();
        this.maxThreads = maxThreads || require("os").cpus().length;
        this.initWorkers();
    }

    /**
     * 获取单例实例
     * @param maxThreads 最大线程数
     * @returns ThreadPool实例
     */
    public static getInstance(maxThreads?: number): ThreadPool {
        if (!ThreadPool.instance) {
            ThreadPool.instance = new ThreadPool(maxThreads);
        }
        return ThreadPool.instance;
    }

    /**
     * 初始化工作线程
     */
    private initWorkers(): void {
        for(let i = 0; i < this.maxThreads; i++) {
            const worker = new WorkerHandler();
            this.workers.push(worker);
            
            worker.on("message", (message) => {
                this.handleWorkerMessage(message);
            });
            
            worker.on("error", (error) => {
                this.handleWorkerError(error);
            });
            
            worker.on("exit", (code) => {
                this.handleWorkerExit(code, i);
            });
        }
    }

    /**
     * 处理工作线程消息
     * @param message 消息内容
     */
    private handleWorkerMessage(message: any): void {
        const { taskId, result, error } = message;
        
        if (this.results[ taskId ]) {
            if (error) {
                this.results[ taskId ].reject(new Error(error.message));
            } else {
                this.results[ taskId ].resolve(result);
            }
            delete this.results[ taskId ];
        }
        
        this.emit("taskUpdate", { id: taskId, status: error ? "failed" : "completed" });
        this.processQueue();
    }

    /**
     * 处理工作线程错误
     * @param error 错误信息
     */
    private handleWorkerError(error: Error): void {
        console.error("工作线程错误:", error);
    }

    /**
     * 处理工作线程退出
     * @param code 退出码
     * @param index 线程索引
     */
    private handleWorkerExit(code: number, index: number): void {
        console.log(`工作线程 ${index} 退出，退出码: ${code}`);
        // 重启工作线程
        const worker = new WorkerHandler();
        this.workers[ index ] = worker;
        
        worker.on("message", (message) => {
            this.handleWorkerMessage(message);
        });
        
        worker.on("error", (error) => {
            this.handleWorkerError(error);
        });
        
        worker.on("exit", (exitCode) => {
            this.handleWorkerExit(exitCode, index);
        });
    }

    /**
     * 处理任务队列
     */
    private processQueue(): void {
        if (this.taskQueue.length === 0) return;
        
        const idleWorker = this.workers.find(worker => !worker.isBusy);
        if (idleWorker) {
            const task = this.taskQueue.shift();
            if (task) {
                task.status = "running";
                this.emit("taskUpdate", { id: task.id , status: "running" });
                idleWorker.execute(task.id, task.handler, task.data, task.timeout);
            }
        }
    }

    /**
     * 执行任务
     * @param taskId 任务ID
     * @param handler 任务处理器
     * @param data 任务数据
     * @param timeout 超时时间
     * @returns Promise
     */
    public execute(taskId: string, handler: string, data: unknown, timeout: number = 30000): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.results[ taskId ] = { resolve, reject };
            
            this.taskQueue.push({ id: taskId ,
                handler,
                data,
                retries: 0,
                timeout,
                status: "pending"
            });
            
            this.emit("taskUpdate", { id: taskId , status: "pending" });
            this.processQueue();
        });
    }

    /**
     * 关闭线程池
     */
    public async shutdown(): Promise<void> {
        for (const worker of this.workers) {
            await worker.terminate();
        }
        this.workers = [];
        this.taskQueue = [];
        this.results = {};
    }
}