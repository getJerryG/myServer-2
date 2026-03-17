# 日志系统使用文档

## 概述

本项目使用 Winston 作为日志库，提供全面且高效的日志记录功能。

## 特性

- 日志分级：DEBUG、INFO、WARN、ERROR、FATAL
- 日志轮转：按日期和大小自动轮转
- 多种输出方式：控制台和文件
- 模块化日志：支持按模块创建独立 logger
- 日志查询：支持按级别、时间、模块查询
- 环境感知：生产环境自动禁用 DEBUG 级别

## 安装依赖

```bash
pnpm add winston @types/winston
```

## 配置

### 环境变量

在 `.env` 文件中配置以下变量：

```env
LOG_LEVEL=INFO              # 日志级别：DEBUG、INFO、WARN、ERROR、FATAL
LOG_DIR=logs              # 日志目录（默认：logs）
LOG_MAX_SIZE=100m         # 单个日志文件最大大小（默认：100m）
LOG_MAX_FILES=30          # 最多保留天数（默认：30）
NODE_ENV=production        # 环境变量（生产环境自动禁用DEBUG）
```

### 默认配置

- 日志目录：`logs/`
- 单文件最大大小：100MB
- 保留天数：30天
- 生产环境禁用：DEBUG 级别

## 使用方法

### 基本使用

```typescript
import { logger } from "~/utils/logger";

const appLogger = logger.create();

appLogger.info("应用启动成功");
appLogger.error("数据库连接失败", new Error("Connection timeout"));
appLogger.warn("缓存命中率较低");
appLogger.fatal("系统崩溃", new Error("Fatal error"));
```

### 模块化日志

```typescript
import { logger, LogLevel } from "~/utils/logger";

const userServiceLogger = logger.createModule("UserService");
const dbServiceLogger = logger.createModule("DatabaseService");

userServiceLogger.info("用户登录成功", { userId: 123 });
dbServiceLogger.error("查询失败", new Error("Query timeout"), { query: "SELECT * FROM users" });
```

### 设置日志级别

```typescript
import { logger, LogLevel } from "~/utils/logger";

const appLogger = logger.create();

appLogger.setLevel(LogLevel.ERROR);

appLogger.debug("这条调试信息不会被记录");
appLogger.error("这条错误信息会被记录", new Error("Error"));
```

### 日志级别说明

| 级别 | 值 | 说明 | 生产环境 |
|------|-----|------|----------|
| DEBUG | 0 | 调试信息，用于开发调试 | 禁用 |
| INFO | 1 | 一般信息，记录系统运行状态 | 启用 |
| WARN | 2 | 警告信息，记录潜在问题 | 启用 |
| ERROR | 3 | 错误信息，记录运行时错误 | 启用 |
| FATAL | 4 | 致命错误，记录系统崩溃 | 启用 |

## 日志查询

### 按级别查询

```typescript
import { logger } from "~/utils/logger";

const errorLogs = await logger.query.recentErrors(50);
console.log(`最近50条错误日志：`, errorLogs);
```

### 按时间范围查询

```typescript
import { logger } from "~/utils/logger";

const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
const endDate = new Date();

const logs = await logger.query.byTimeRange(startDate, endDate, 100);
console.log(`最近24小时的日志：`, logs);
```

### 按模块查询

```typescript
import { logger } from "~/utils/logger";

const userServiceLogs = await logger.query.byModule("UserService", 100);
console.log(`UserService模块的日志：`, userServiceLogs);
```

### 搜索日志

```typescript
import { logger } from "~/utils/logger";

const searchResults = await logger.query.search("错误", 100);
console.log(`包含"错误"关键字的日志：`, searchResults);
```

### 获取统计信息

```typescript
import { logger } from "~/utils/logger";

const stats = await logger.query.statistics();
console.log(`日志统计：`, stats);
```

## 日志维护

### 清理旧日志

```typescript
import { logger } from "~/utils/logger";

const deletedCount = await logger.maintenance.cleanOldLogs(30);
console.log(`已清理 ${deletedCount} 个超过30天的日志文件`);
```

## 日志格式

### 控制台输出格式

```
[2024-01-13 10:30:45.123] [INFO] [UserService] [PID:12345] 用户登录成功
```

### 文件输出格式（JSON）

```json
{
  "timestamp": "2024-01-13 10:30:45.123",
  "level": "info",
  "module": "UserService",
  "pid": 12345,
  "message": "用户登录成功"
}
```

## 日志文件结构

```
logs/
  ├── app-2024-01-13.log
  ├── app-2024-01-12.log
  ├── app-2024-01-11.log
  ├── error-2024-01-13.log
  ├── error-2024-01-12.log
  └── error-2024-01-11.log
```

## 最佳实践

### 1. 使用模块化日志

为不同的模块创建独立的 logger 实例，便于追踪问题来源。

```typescript
const userServiceLogger = logger.createModule("UserService");
const paymentServiceLogger = logger.createModule("PaymentService");
```

### 2. 合理使用日志级别

- DEBUG：开发调试信息
- INFO：重要的业务流程信息
- WARN：潜在问题但不影响运行
- ERROR：需要关注的错误
- FATAL：系统级别的严重错误

### 3. 包含上下文信息

在日志中包含相关的上下文信息，便于问题定位。

```typescript
userServiceLogger.info("用户登录成功", { 
    userId: 123, 
    ip: "192.168.1.1", 
    userAgent: "Mozilla/5.0" 
});
```

### 4. 错误处理

使用 Error 对象记录错误，保留完整的错误堆栈。

```typescript
try {
    await someOperation();
} catch (error) {
    userServiceLogger.error("操作失败", error, { operation: "someOperation" });
}
```

### 5. 性能考虑

避免在循环中频繁记录日志，可以使用批量记录或采样记录。

```typescript
const errors = [];
for (const item of items) {
    try {
        await processItem(item);
    } catch (error) {
        errors.push(error);
    }
}

if (errors.length > 0) {
    userServiceLogger.error(`批量处理失败 ${errors.length} 个项目`, new Error("Batch processing failed"), { 
        errorCount: errors.length,
        errors: errors.map(e => e.message) 
    });
}
```

## 故障排查

### 查看实时日志

```bash
# 查看应用日志
tail -f logs/app-$(date +%Y-%m-%d).log

# 查看错误日志
tail -f logs/error-$(date +%Y-%m-%d).log
```

### 搜索特定错误

```bash
# 搜索包含"Connection"的日志
grep "Connection" logs/app-*.log

# 搜索特定模块的日志
grep "UserService" logs/app-*.log
```

### 统计日志级别

```bash
# 统计各级别日志数量
grep -c "ERROR" logs/app-*.log
grep -c "WARN" logs/app-*.log
grep -c "INFO" logs/app-*.log
```

## API 参考

### Logger 类方法

```typescript
class Logger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
    setLevel(level: LogLevel | string): void;
    getLevel(): string;
    getModuleName(): string;
}
```

### 全局 logger 方法

```typescript
const logger = {
    create(): Logger;
    createModule(moduleName: string): Logger;
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    query: {
        logs: (options: LogQueryOptions) => Promise<LogEntry[]>;
        byLevel: (level: LogLevel, limit?: number) => Promise<LogEntry[]>;
        byTimeRange: (startDate: Date, endDate: Date, limit?: number) => Promise<LogEntry[]>;
        byModule: (moduleName: string, limit?: number) => Promise<LogEntry[]>;
        statistics: () => Promise<LogStatistics>;
        search: (keyword: string, limit?: number) => Promise<LogEntry[]>;
        recentErrors: (limit?: number) => Promise<LogEntry[]>;
        recentFatals: (limit?: number) => Promise<LogEntry[]>;
    };
    maintenance: {
        cleanOldLogs: (daysToKeep?: number) => Promise<number>;
    };
    config: {
        getLogDir(): string;
        getMaxSize(): string;
        getMaxFiles(): number;
    };
}
```

## 常见问题

### Q: 如何在生产环境启用 DEBUG 日志？

A: 修改 `.env` 文件，设置 `NODE_ENV=development` 或设置 `LOG_LEVEL=DEBUG`。

### Q: 日志文件过大怎么办？

A: 系统会自动按日期和大小进行轮转，单个文件超过 100MB 会自动创建新文件。可以通过调整 `LOG_MAX_SIZE` 环境变量来控制。

### Q: 如何永久保存日志？

A: 将日志目录添加到 `.gitignore`，并定期备份日志文件到外部存储。

### Q: 日志查询性能如何？

A: 日志查询会读取和解析日志文件，建议限制查询范围和结果数量，避免影响系统性能。
