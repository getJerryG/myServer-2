/**
 * 单例模式工具函数
 */

/**
 * 创建单例实例的工厂函数
 * @param className 要创建单例的类
 * @returns 单例实例的构造函数
 */
export default function singleton<T extends new (...args: unknown[]) => any>(className: T): T {
    let instance: InstanceType<T>;
    
    // 返回一个代理构造函数
    return class Singleton extends className {
        constructor(...args: unknown[]) {
            // 如果实例不存在，创建新实例
            if (!instance) {
                super(...args);
                instance = this as InstanceType<T>;
            }
            // 返回已有的实例
            return instance;
        }
    } as unknown as T;
}
