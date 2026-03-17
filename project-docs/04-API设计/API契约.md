# API契约

## 1. 概述

本文档定义了狼人杀赛事平台后端的API接口规范，包括接口路径、请求方法、请求参数、响应格式等。所有API接口遵循RESTful设计原则，使用统一的响应格式和错误处理机制。

## 2. 基本规则

### 2.1 响应格式

所有API接口返回统一的JSON格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {} 
}
```

### 2.2 错误代码

| 错误代码 | 描述 |
|----------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 2.3 认证方式

- 使用JWT认证，通过Authorization请求头传递token
- 格式：`Authorization: Bearer <token>`

## 3. API接口

### 3.1 认证模块

#### 3.1.1 微信登录

```
POST /openid/login
```

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| code | string | 是 | 微信登录凭证code |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| userId | number | 用户ID |
| username | string | 用户名 |
| openId | string | 微信OpenID |
| token | string | JWT令牌 |

**示例响应**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": 12345,
    "username": "玩家123",
    "openId": "oXxXxXxXxXxXxXxXxXxXxX",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.2 用户管理模块

#### 3.2.1 获取当前用户信息

```
GET /users
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| userId | number | 用户ID |
| username | string | 用户名 |
| nickname | string | 用户昵称 |
| avatar | string | 用户头像 |
| status | number | 用户状态 |
| role | number | 用户角色 |
| sex | number | 用户性别 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 12345,
    "username": "玩家123",
    "nickname": "游戏达人",
    "avatar": "https://example.com/avatar.jpg",
    "status": 1,
    "role": 0,
    "sex": 1
  }
}
```

#### 3.2.2 更新用户信息

```
PUT /users/upDataInfo
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| avatar | string | 否 | 用户头像 |
| sex | number | 否 | 用户性别 |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| userId | number | 用户ID |
| username | string | 用户名 |
| nickname | string | 用户昵称 |
| avatar | string | 用户头像 |
| sex | number | 用户性别 |

**示例响应**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "userId": 12345,
    "username": "玩家123",
    "nickname": "新昵称",
    "avatar": "https://example.com/new-avatar.jpg",
    "sex": 1
  }
}
```

#### 3.2.3 用户签到

```
POST /users/signIn
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| signInDays | number | 连续签到天数 |
| lastSignInTime | string | 最后签到时间 |
| reward | object | 签到奖励 |

**示例响应**：

```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "signInDays": 5,
    "lastSignInTime": "2024-01-01T08:00:00.000Z",
    "reward": {
      "exp": 100,
      "coins": 50
    }
  }
}
```

### 3.3 赛事管理模块

#### 3.3.1 获取赛事列表

```
GET /contest
```

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| status | number | 否 | 赛事状态（0: 未开始, 1: 报名中, 2: 进行中, 3: 已结束, 4: 已取消, 5: 已删除） |
| type | string | 否 | 赛事类型（individual: 个人赛, team: 团队赛） |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| list | array | 赛事列表 |
| total | number | 总数量 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "contestId": 1,
        "name": "狼人杀春季赛",
        "type": "team",
        "rule": "elimination",
        "status": 1,
        "startDay": "2024-03-01T00:00:00.000Z",
        "endDay": "2024-04-01T00:00:00.000Z",
        "maxSignTeams": 48,
        "currentSignTeams": 24
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 3.3.2 创建赛事

```
POST /contest
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 是 | 赛事名称 |
| type | string | 是 | 赛事类型（individual: 个人赛, team: 团队赛） |
| rule | string | 是 | 赛制规则（elimination: 淘汰赛, round_robin: 循环赛） |
| startDay | string | 是 | 赛事开始时间 |
| endDay | string | 是 | 赛事结束时间 |
| contestIntroduction | string | 否 | 赛事介绍 |
| maxSignTeams | number | 是 | 最大报名队伍数 |
| registrationType | string | 是 | 报名类型（free: 免费报名, paid: 付费报名） |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| contestId | number | 赛事ID |

**示例响应**：

```json
{
  "code": 200,
  "message": "赛事创建成功",
  "data": {
    "contestId": 1
  }
}
```

#### 3.3.3 获取赛事详情

```
GET /contest/:contestId
```

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| contestId | number | 是 | 赛事ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| contestId | number | 赛事ID |
| name | string | 赛事名称 |
| type | string | 赛事类型 |
| rule | string | 赛制规则 |
| status | number | 赛事状态 |
| startDay | string | 赛事开始时间 |
| endDay | string | 赛事结束时间 |
| contestIntroduction | string | 赛事介绍 |
| maxSignTeams | number | 最大报名队伍数 |
| currentSignTeams | number | 当前报名队伍数 |
| creatorId | string | 创建者ID |
| creatorName | string | 创建者名称 |
| registrationType | string | 报名类型 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "contestId": 1,
    "name": "狼人杀春季赛",
    "type": "team",
    "rule": "elimination",
    "status": 1,
    "startDay": "2024-03-01T00:00:00.000Z",
    "endDay": "2024-04-01T00:00:00.000Z",
    "contestIntroduction": "这是一场精彩的狼人杀春季赛",
    "maxSignTeams": 48,
    "currentSignTeams": 24,
    "creatorId": "12345",
    "creatorName": "赛事管理员",
    "registrationType": "free"
  }
}
```

#### 3.3.4 报名赛事

```
POST /contest/:contestId/register
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| contestId | number | 是 | 赛事ID |
| teamName | string | 否 | 队伍名称（团队赛必填） |
| teamMembers | array | 否 | 队伍成员（团队赛必填） |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| registrationId | string | 报名ID |
| status | string | 报名状态（pending: 待审核, approved: 已通过, rejected: 已拒绝） |

**示例响应**：

```json
{
  "code": 200,
  "message": "报名成功",
  "data": {
    "registrationId": "reg_12345",
    "status": "pending"
  }
}
```

#### 3.3.5 获取赛程列表

```
GET /contest/:contestId/schedules
```

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| contestId | number | 是 | 赛事ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| list | array | 赛程列表 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "roundName": "小组赛",
        "roundOrder": 1,
        "startDate": "2024-03-01T00:00:00.000Z",
        "endDate": "2024-03-15T00:00:00.000Z",
        "participatingTeamsCount": 48,
        "promotedTeamsCount": 24,
        "eliminationInfo": {
          "mode": "ratio",
          "ratio": 0.5,
          "description": "淘汰50%的队伍"
        }
      }
    ]
  }
}
```

#### 3.3.6 获取今日赛程

```
GET /contest/:contestId/today-schedule
```

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| contestId | number | 是 | 赛事ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| date | string | 日期 |
| matches | array | 今日比赛列表 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2024-03-01",
    "matches": [
      {
        "matchId": "match_12345",
        "time": "19:00",
        "requiredPlayers": 12,
        "status": "scheduled",
        "room": "Room1",
        "edition": "标准场"
      }
    ]
  }
}
```

### 3.4 群组管理模块

#### 3.4.1 创建群组

```
POST /clan
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 是 | 群组名称 |
| description | string | 否 | 群组描述 |
| avatar | string | 否 | 群组头像 |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| clanId | string | 群组ID |

**示例响应**：

```json
{
  "code": 200,
  "message": "群组创建成功",
  "data": {
    "clanId": "clan_12345"
  }
}
```

### 3.5 货币系统模块

#### 3.5.1 获取货币余额

```
GET /currency/balance
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| coins | number | 金币余额 |
| diamonds | number | 钻石余额 |
| exp | number | 经验值 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "coins": 1000,
    "diamonds": 100,
    "exp": 5000
  }
}
```

### 3.6 媒体服务模块

#### 3.6.1 上传图片

```
POST /upload
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |
| Content-Type | string | 是 | multipart/form-data |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| file | file | 是 | 图片文件 |
| type | string | 是 | 图片类型（avatar: 头像, poster: 海报, other: 其他） |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| url | string | 图片URL |
| filename | string | 文件名 |

**示例响应**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/images/avatar/12345.jpg",
    "filename": "12345.jpg"
  }
}
```

## 4. 管理员API

### 4.1 用户管理

#### 4.1.1 获取所有用户

```
GET /admin/users
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | number | 否 | 用户状态 |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| list | array | 用户列表 |
| total | number | 总数量 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "userId": 12345,
        "username": "玩家123",
        "nickname": "游戏达人",
        "avatar": "https://example.com/avatar.jpg",
        "status": 1,
        "role": 0,
        "sex": 1
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 4.1.2 修改用户角色

```
PUT /admin/users/:userId/role
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | number | 是 | 用户ID |
| role | number | 是 | 用户角色（0: 普通用户, 1: 赛事管理员, 2: 系统管理员） |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| userId | number | 用户ID |
| role | number | 新角色 |

**示例响应**：

```json
{
  "code": 200,
  "message": "角色修改成功",
  "data": {
    "userId": 12345,
    "role": 1
  }
}
```

### 4.2 赛事管理

#### 4.2.1 审核报名

```
PUT /api/contest-admin/:contestId/registrations/:registrationId/status
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| contestId | number | 是 | 赛事ID |
| registrationId | string | 是 | 报名ID |
| status | string | 是 | 审核状态（approved: 已通过, rejected: 已拒绝） |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| registrationId | string | 报名ID |
| status | string | 审核状态 |

**示例响应**：

```json
{
  "code": 200,
  "message": "审核成功",
  "data": {
    "registrationId": "reg_12345",
    "status": "approved"
  }
}
```

## 5. 监控API

#### 5.1 获取系统状态

```
GET /api/monitor/status
```

**请求头**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer token |

**响应参数**：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| cpu | number | CPU使用率 |
| memory | number | 内存使用率 |
| disk | number | 磁盘使用率 |
| uptime | string | 系统运行时间 |
| requestCount | number | 今日请求数 |
| errorCount | number | 今日错误数 |

**示例响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "cpu": 20,
    "memory": 45,
    "disk": 60,
    "uptime": "1d 2h 30m",
    "requestCount": 1000,
    "errorCount": 5
  }
}
```

## 6. 总结

本文档定义了狼人杀赛事平台后端的API接口规范，涵盖了用户管理、赛事管理、群组管理、货币系统、媒体服务等核心功能模块。所有API接口遵循RESTful设计原则，使用统一的响应格式和错误处理机制，确保接口的一致性和易用性。

随着平台功能的扩展，API接口可能会不断更新和完善，本文档将同步更新。