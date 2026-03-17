/**
 * 事件发射器工具
 */

// 事件名称类型
export type EventName = string;

// 事件回调函数类型
type EventCallback = (...args: unknown[]) => void;

/**
 * 事件发射器类
 */
export class EventEmitter {
    // 事件监听器映射
    private listeners: Map<EventName, Set<EventCallback>>;

    /**
     * 构造函数
     */
    constructor() {
        this.listeners = new Map();
    }

    /**
     * 注册事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    on(eventName: EventName, callback: EventCallback): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)?.add(callback);
    }

    /**
     * 注册单次事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    once(eventName: EventName, callback: EventCallback): void {
        const onceCallback = (...args: unknown[]) => {
            callback(...args);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }

    /**
     * 移除事件监听器
     * @param eventName 事件名称
     * @param callback 回调函数
     */
    off(eventName: EventName, callback: EventCallback): void {
        if (this.listeners.has(eventName)) {
            const callbacks = this.listeners.get(eventName);
            callbacks?.delete(callback);
            if (callbacks?.size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    /**
     * 移除所有事件监听器
     * @param eventName 事件名称（可选），如果不提供则移除所有事件的监听器
     */
    removeAllListeners(eventName?: EventName): void {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * 触发事件
     * @param eventName 事件名称
     * @param args 事件参数
     */
    emit(eventName: EventName, ...args: unknown[]): void {
        if (this.listeners.has(eventName)) {
            const callbacks = this.listeners.get(eventName);
            callbacks?.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * 获取事件监听器数量
     * @param eventName 事件名称
     * @returns 监听器数量
     */
    listenerCount(eventName: EventName): number {
        return this.listeners.get(eventName)?.size || 0;
    }

    /**
     * 获取所有事件名称
     * @returns 事件名称数组
     */
    eventNames(): EventName[] {
        return Array.from(this.listeners.keys());
    }
}

// 创建并导出默认事件发射器实例
export const eventEmitter = new EventEmitter();
