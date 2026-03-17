import { Worker } from "worker_threads";
import EventEmitter from "events";

// 类型定义
interface WorkerResultMessage {
    type: "TASK_COMPLETED";
    taskId: string;
    result: unknown;
}

interface WorkerErrorMessage {
    type: "TASK_FAILED";
    taskId: string;
    error: string;
}

type WorkerMessage = WorkerResultMessage | WorkerErrorMessage;

interface HandlerMessage {
    taskId: string;
    result?: unknown;
    error?: Error;
}

/**
 * 工作线程处理器
 * 用于处理线程池中的任务
 */
class WorkerHandler extends EventEmitter {
    private worker: Worker;
    public isBusy: boolean = false;

    /**
     * 构造函数
     */
    constructor() {
        super();
        this.worker = this.createWorker();
        this.setupEventListeners();
    }

    /**
     * 创建工作线程
     * @returns Worker实例
     */
    private createWorker(): Worker {
        // 使用一个简单的内联工作线程实现
        const workerCode = `
            const { parentPort } = require('worker_threads');
            
            parentPort.on('message', async (message) => {
                try {
                    const { taskId, handler, data, timeout } = message;
                    
                    // 创建处理器函数
                    const handlerFn = new Function('data', handler);
                    
                    // 设置超时
                    let timeoutId;
                    const timeoutPromise = new Promise((_, reject) => {
                        timeoutId = setTimeout(() => {
                            reject(new Error('Task timed out after ' + timeout + 'ms'));
                        }, timeout);
                    });
                    
                    // 执行任务
                    const result = await Promise.race([handlerFn(data), timeoutPromise]);
                    
                    // 清除超时
                    clearTimeout(timeoutId);
                    
                    // 发送任务完成消息
                    parentPort.postMessage({ 
                        type: 'TASK_COMPLETED',
                        taskId,
                        result
                    });
                } catch (error) {
                    // 发送任务失败消息
                    parentPort.postMessage({ 
                        type: 'TASK_FAILED',
                        taskId: message.taskId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        `;
        
        // 创建工作线程
        return new Worker(workerCode, { eval: true });
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        this.worker.on("message", (message: WorkerMessage) => {
            if (message.type === "TASK_COMPLETED") {
                this.isBusy = false;
                this.emit("message", { 
                    taskId: message.taskId, 
                    result: message.result 
                } as HandlerMessage);
            } else if (message.type === "TASK_FAILED") {
                this.isBusy = false;
                this.emit("message", { 
                    taskId: message.taskId, 
                    error: new Error(message.error) 
                } as HandlerMessage);
            }
        });
        
        this.worker.on("error", (error: Error) => {
            this.emit("error", error);
        });
        
        this.worker.on("exit", (code: number) => {
            this.emit("exit", code);
        });
    }

    /**
     * 执行任务
     * @param taskId 任务ID
     * @param handler 任务处理器
     * @param data 任务数据
     * @param timeout 超时时间
     */
    public execute(taskId: string, handler: string, data: unknown, timeout: number): void {
        this.isBusy = true;
        this.worker.postMessage({
            taskId,
            handler,
            data,
            timeout
        });
    }

    /**
     * 终止工作线程
     */
    public async terminate(): Promise<void> {
        await this.worker.terminate();
    }
}

export default WorkerHandler;