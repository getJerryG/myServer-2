# 数据库设计

## 1. 数据库概述

狼人杀赛事平台使用 MongoDB 作为主要数据库，采用文档型数据结构，通过 Mongoose ODM 进行数据访问。数据库设计遵循模块化原则，每个功能模块对应独立的集合，便于维护和扩展。

## 2. 核心模型设计

### 2.1 用户模型 (users)

#### 2.1.1 模型定义

```typescript
const userSchema = new Schema<UserDocument>(
    {
        userId: {              // 用户ID（自增）
            type: Number,
            required: true,
            unique: true,
            default: 0
        },
        openId: {              // 微信OpenID
            type: String,
            required: true,
            unique: true
        },
        session_key: {         // 微信会话密钥
            type: String
        },
        nickname: {            // 用户昵称
            type: String,
            default: ""
        },
        avatar: {              // 用户头像
            type: String,
            default: ""
        },
        status: {              // 用户状态
            type: Number,
            default: 0         // 0: 正常, 1: 禁用, 2: 注销
        },
        role: {                // 用户角色
            type: Number,
            default: 0         // 0: 普通用户, 1: 赛事管理员, 2: 系统管理员
        },
        user_title: {          // 用户头衔
            type: Array,
            default: []
        },
        sex: {                 // 用户性别
            type: Number,
            default: 0         // 0: 未知, 1: 男, 2: 女
        },
        permission: {          // 用户权限
            type: Number,
            default: 0
        }
    },
    {
        ...option,
        discriminatorKey: "kind",
    }
);
```

#### 2.1.2 索引设计

| 字段名 | 索引类型 | 索引名 | 描述 |
|--------|----------|--------|------|
| userId | 唯一索引 | userId_unique_index | 用户ID唯一索引 |
| openId | 唯一索引 | openId_unique_index | 微信OpenID唯一索引 |
| createdAt | 普通索引 | user_createTime_index | 创建时间索引 |
| updatedAt | 普通索引 | user_updateTime_index | 更新时间索引 |

### 2.2 赛事模型 (contests)

#### 2.2.1 模型定义

```typescript
const contestSchema = new Schema<IContest>(
    {
        contestId: {              // 赛事ID（自增）
            type: Number,
            required: true,
            unique: true
        },
        name: {                   // 赛事名称
            type: String,
            required: true,
            unique: true,
            default: ""
        },
        type: {                   // 赛事类型
            type: String,
            required: true,
            enum: ["individual", "team"],
            default: "team"        // individual: 个人赛, team: 团队赛
        },
        rule: {                   // 赛制规则
            type: String,
            required: true,
            enum: ["elimination", "round_robin"],
            default: "elimination"  // elimination: 淘汰赛, round_robin: 循环赛
        },
        status: {                 // 赛事状态
            type: Number,
            required: true,
            enum: [0, 1, 2, 3, 4, 5],
            default: 0            // 0: 未开始, 1: 报名中, 2: 进行中, 3: 已结束, 4: 已取消, 5: 已删除
        },
        startDay: {               // 赛事开始时间
            type: Date,
            required: true
        },
        endDay: {                 // 赛事结束时间
            type: Date,
            required: true
        },
        contestIntroduction: {    // 赛事介绍
            type: String,
            required: false,
            default: ""
        },
        maxSignTeams: {           // 最大报名队伍数
            type: Number,
            required: true,
            default: 48
        },
        creatorId: {              // 创建者ID
            type: String,
            required: true,
            default: ""
        },
        creatorName: {            // 创建者名称
            type: String,
            required: true,
            default: ""
        },
        clanId: {                 // 所属群组ID
            type: String,
            required: false
        },
        currentSignTeams: {       // 当前报名队伍数
            type: Number,
            required: true,
            default: 0
        },
        registrationType: {       // 报名类型
            type: String,
            required: true,
            enum: ["free", "paid"],
            default: "free"       // free: 免费报名, paid: 付费报名
        }
    },
    option
);
```

#### 2.2.2 索引设计

| 字段名 | 索引类型 | 索引名 | 描述 |
|--------|----------|--------|------|
| contestId | 唯一索引 | contestId_unique_index | 赛事ID唯一索引 |
| name | 唯一索引 | contest_name_unique_index | 赛事名称唯一索引 |
| status | 普通索引 | contest_status_index | 赛事状态索引 |
| startDay | 普通索引 | contest_startDay_index | 开始时间索引 |
| endDay | 普通索引 | contest_endDay_index | 结束时间索引 |
| createdAt | 普通索引 | contest_createTime_index | 创建时间索引 |
| updatedAt | 普通索引 | contest_updateTime_index | 更新时间索引 |

### 2.3 赛程模型 (contestSchedules)

#### 2.3.1 模型定义

```typescript
const contestScheduleSchema = new Schema<IContestSchedule>(
    {
        contest_id: {              // 关联赛事ID
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Contest"
        },
        roundName: {              // 轮次名称
            type: String,
            required: true,
            default: ""
        },
        roundOrder: {             // 轮次顺序
            type: Number,
            required: true,
            default: 1
        },
        startDate: {              // 轮次开始时间
            type: Date,
            required: true
        },
        endDate: {                // 轮次结束时间
            type: Date,
            required: true
        },
        participatingTeamsCount: { // 参赛队伍数
            type: Number,
            required: true,
            default: 0
        },
        promotedTeamsCount: {     // 晋级队伍数
            type: Number,
            required: true,
            default: 0
        },
        eliminationInfo: {        // 淘汰规则
            type: {
                mode: {           // 淘汰模式
                    type: String,
                    required: true,
                    enum: ["ratio", "fixed"]
                },
                ratio: {          // 淘汰比例（mode为ratio时必填）
                    type: Number,
                    required: false
                },
                baseMultiple: {    // 基础倍数
                    type: Number,
                    required: false
                },
                fromRank: {        // 起始排名
                    type: Number,
                    required: false
                },
                toRank: {          // 结束排名
                    type: Number,
                    required: false
                },
                description: {     // 规则描述
                    type: String,
                    required: true,
                    default: ""
                }
            },
            required: true
        },
        schedule: {               // 赛程安排
            type: [{
                date: {           // 日期
                    type: String,
                    required: true
                },
                matches: {        // 当日比赛
                    type: [{
                        matchId: {           // 比赛ID
                            type: String,
                            required: true
                        },
                        time: {              // 比赛时间
                            type: String,
                            required: true
                        },
                        requiredPlayers: {   // 所需玩家数
                            type: Number,
                            required: true,
                            default: 1
                        },
                        status: {            // 比赛状态
                            type: String,
                            required: true,
                            enum: ["scheduled", "in_progress", "completed", "cancelled"],
                            default: "scheduled"
                        },
                        room: {              // 比赛房间
                            type: String,
                            required: true
                        },
                        edition: {           // 比赛版型
                            type: String,
                            required: true,
                            default: "标准场"
                        }
                    }],
                    required: true
                }
            }],
            required: true,
            default: []
        }
    },
    option
);
```

#### 2.3.2 索引设计

| 字段名 | 索引类型 | 索引名 | 描述 |
|--------|----------|--------|------|
| contest_id | 普通索引 | contestSchedule_contest_id_index | 赛事ID索引 |
| contest_id + roundName | 唯一索引 | contestSchedule_contest_id_roundName_unique_index | 赛事ID和轮次名称联合唯一索引 |
| roundOrder | 普通索引 | contestSchedule_roundOrder_index | 轮次顺序索引 |
| startDate | 普通索引 | contestSchedule_startDate_index | 轮次开始时间索引 |
| endDate | 普通索引 | contestSchedule_endDate_index | 轮次结束时间索引 |
| createdAt | 普通索引 | contestSchedule_createTime_index | 创建时间索引 |
| updatedAt | 普通索引 | contestSchedule_updateTime_index | 更新时间索引 |

### 2.4 签到模型 (signIn)

#### 2.4.1 模型定义

```typescript
// signInSchema 作为 UserModel 的 discriminator
// 继承自 UserDocument
```

## 3. 模型关系

### 3.1 关系图

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    users        │     │   contests      │     │ contestSchedules │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        ├────────────────────────┤
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    signIn       │     │  报名记录       │     │   比赛记录       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.2 关系说明

1. **用户与赛事**：
   - 一个用户可以创建多个赛事
   - 一个赛事可以有多个参赛用户

2. **赛事与赛程**：
   - 一个赛事可以包含多个赛程（轮次）
   - 一个赛程属于一个赛事

3. **用户与签到**：
   - 一个用户可以有多个签到记录
   - 一个签到记录属于一个用户

4. **赛事与报名记录**：
   - 一个赛事可以有多个报名记录
   - 一个报名记录属于一个赛事

5. **赛程与比赛记录**：
   - 一个赛程可以包含多个比赛记录
   - 一个比赛记录属于一个赛程

## 4. 数据类型说明

| 数据类型 | 用途 | 示例 |
|----------|------|------|
| Number | 数值类型 | userId, status, role |
| String | 字符串类型 | name, openId, avatar |
| Date | 日期类型 | startDay, endDay |
| Array | 数组类型 | user_title, schedule |
| Object | 对象类型 | eliminationInfo |
| Boolean | 布尔类型 | 状态字段（如isActive） |
| Mixed | 混合类型 | 灵活数据结构 |

## 5. 设计原则

### 5.1 数据一致性

- 使用事务确保复杂操作的数据一致性
- 采用引用关系而非嵌入关系，避免数据冗余
- 定期进行数据校验和清理

### 5.2 性能优化

- 合理设计索引，优化查询性能
- 采用分级缓存策略，减少数据库压力
- 对大文档进行拆分，提高查询效率

### 5.3 安全性

- 敏感数据加密存储
- 实现细粒度的权限控制
- 定期备份数据，确保数据安全

### 5.4 可扩展性

- 模块化设计，便于功能扩展
- 支持横向扩展，应对高并发
- 预留扩展字段，便于未来需求变更

## 6. 数据库配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| host | 数据库地址 | localhost |
| port | 数据库端口 | 27017 |
| db | 数据库名称 | werewolf_contest |
| connectTimeout | 连接超时时间 | 5000ms |
| retryStrategy | 重试策略 | 最大延迟5000ms |
| maxRetriesPerRequest | 每个请求最大重试次数 | 10 |

## 7. 索引优化建议

1. **根据查询模式优化索引**：
   - 针对频繁查询的字段创建索引
   - 避免创建过多索引，影响写入性能

2. **复合索引设计**：
   - 对于多字段查询，创建复合索引
   - 复合索引字段顺序应考虑查询频率

3. **定期优化索引**：
   - 定期分析索引使用情况
   - 删除不常用的索引

## 8. 数据备份与恢复

- 定期进行全量备份
- 针对重要数据进行增量备份
- 建立完善的数据恢复机制

## 9. 总结

狼人杀赛事平台数据库设计遵循了模块化、高性能、安全性和可扩展性原则，通过合理的模型设计和索引优化，能够支持平台的各种业务需求。数据库采用了关系型和文档型数据模型的结合，既保证了数据的完整性，又提供了灵活的数据结构支持。