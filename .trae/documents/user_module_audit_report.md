# User 模块数据库字段审计报告

**审计时间**: 2024-01-15
**审计范围**: User 模块（代码定义 vs 数据库Schema）

---

## 📊 审计摘要

| 项目 | 数量 |
|------|------|
| 代码定义字段总数 | 15 |
| 数据库Schema字段总数 | 13 |
| 类型不匹配字段数 | 1 |
| 代码中缺失字段数 | 2 |
| 数据库中多余字段数 | 0 |

---

## 🔍 详细对比分析

### 1. 字段对比表

| 字段名 | 代码定义类型 | 数据库Schema类型 | 状态 | 备注 |
|--------|------------|----------------|------|------|
| userId | number | Number | ✅ 一致 | 用户ID（自增） |
| userID | string | - | ❌ 数据库缺失 | 用户ID字符串（冗余） |
| openId | string | String | ✅ 一致 | 微信OpenID |
| session_key | string | String | ✅ 一致 | 会话密钥 |
| nickname | string | String | ✅ 一致 | 昵称 |
| gamename | string | - | ❌ 数据库缺失 | 游戏名称 |
| avatar | string | String | ✅ 一致 | 头像URL |
| status | UserStatus | Number | ✅ 一致 | 用户状态 |
| role | UserRole (0\|1\|2) | Number | ✅ 一致 | 用户角色（旧系统） |
| user_title | Schema.Types.ObjectId[] | Array | ⚠️ 类型不匹配 | 用户称号 |
| sex | UserSex | Number | ✅ 一致 | 性别 |
| exp | number | - | ❌ 数据库缺失 | 经验值 |
| loginCount | number | - | ❌ 数据库缺失 | 登录次数 |
| lastLoginTime | Date | - | ❌ 数据库缺失 | 最后登录时间 |
| signIn | UserSignIn | - | ❌ 数据库缺失 | 签到信息 |
| permission | number | Number | ✅ 一致 | 权限（旧系统） |
| roleIds | - | [Schema.Types.ObjectId] | ⚠️ 代码缺失 | 角色ID列表（新系统） |
| permissionsUpdatedAt | - | Date | ⚠️ 代码缺失 | 权限更新时间（新系统） |

---

## ⚠️ 发现的问题

### 问题1：类型不匹配 - user_title 字段

**严重程度**: ⚠️ 中等

**代码定义**:
```typescript
user_title: Schema.Types.ObjectId[];  // ObjectId数组
```

**数据库Schema**:
```typescript
user_title: {
    type: Array,
    default: []
}
```

**问题描述**:
- 代码定义中 `user_title` 是 `ObjectId[]` 类型，暗示存储的是称号对象的ID数组
- 数据库Schema中 `user_title` 是 `Array` 类型，未指定元素类型
- 这会导致类型不匹配，可能在运行时出现错误

**影响范围**:
- 所有使用 `user_title` 字段的代码
- 用户称号相关的查询和更新操作

**建议方案**:
1. **方案A（推荐）**: 统一为 `ObjectId[]` 类型
   ```typescript
   user_title: {
       type: [Schema.Types.ObjectId],
       default: [],
       ref: "Title"  // 如果是引用Title表
   }
   ```

2. **方案B**: 如果存储的是字符串数组，修改类型定义
   ```typescript
   user_title: string[];  // 字符串数组
   ```

3. **方案C**: 如果存储的是对象数组，需要创建子文档Schema
   ```typescript
   user_title: [{
       type: new Schema({
           titleId: { type: Schema.Types.ObjectId, ref: "Title" },
           obtainedAt: { type: Date }
       })
   }]
   ```

---

### 问题2：代码中缺失字段 - roleIds 和 permissionsUpdatedAt

**严重程度**: ⚠️ 中等

**问题描述**:
- 代码类型定义 `IUser` 接口中缺少 `roleIds` 和 `permissionsUpdatedAt` 字段
- 但数据库Schema中已经定义了这两个字段
- 这会导致TypeScript编译错误或类型不安全

**影响范围**:
- 权限系统集成
- 用户角色管理功能
- 权限缓存更新功能

**建议方案**:
更新 `types/User.d.ts` 文件，添加缺失的字段：

```typescript
export interface UserBase extends Timestamps {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: UserSex;
    avatar: string;
    exp: number;
    status: UserStatus;
    role: UserRole;
    loginCount: number;
    lastLoginTime: Date;
    session_key: string;
    signIn: UserSignIn;
    permission: number;
    
    // 新增字段
    roleIds: Schema.Types.ObjectId[];  // 角色ID列表（新权限系统）
    permissionsUpdatedAt?: Date;  // 权限更新时间（新权限系统）
}
```

---

### 问题3：数据库中缺失字段 - 多个字段

**严重程度**: ⚠️ 低等

**问题描述**:
以下字段在代码类型定义中存在，但数据库Schema中缺失：

1. **userID** (string) - 可能是 userId 的冗余字段
2. **gamename** (string) - 游戏名称
3. **exp** (number) - 经验值
4. **loginCount** (number) - 登录次数
5. **lastLoginTime** (Date) - 最后登录时间
6. **signIn** (UserSignIn) - 签到信息

**影响范围**:
- 用户登录统计功能
- 游戏相关功能
- 用户信息展示

**建议方案**:
1. **方案A（推荐）**: 如果这些字段不再使用，从代码定义中删除
   ```typescript
   // 从 UserBase 接口中删除这些字段
   export interface UserBase extends Timestamps {
       userId: number;
       openId: string;
       // ... 保留其他字段
       // 删除：userID, gamename, exp, loginCount, lastLoginTime, signIn
   }
   ```

2. **方案B**: 如果这些字段仍需使用，添加到数据库Schema
   ```typescript
   const userSchema = new Schema<UserDocument>(
       {
           // ... 现有字段
           
           // 新增字段
           userID: {
               type: String,
               required: false  // 非必填
           },
           gamename: {
               type: String,
               default: ""
           },
           exp: {
               type: Number,
               default: 0
           },
           loginCount: {
               type: Number,
               default: 0
           },
           lastLoginTime: {
               type: Date
           }
       },
       option
   );
   ```

---

## 📝 清理建议

### 优先级1（高）- 立即修复

1. **修复 user_title 类型不匹配**
   - **文件**: `src/models/User/models/users.ts`
   - **操作**: 将 `user_title` 的类型从 `Array` 改为 `[Schema.Types.ObjectId]`
   - **预计工作量**: 10分钟

2. **更新类型定义，添加缺失字段**
   - **文件**: `types/User.d.ts`
   - **操作**: 添加 `roleIds` 和 `permissionsUpdatedAt` 字段
   - **预计工作量**: 5分钟

### 优先级2（中）- 本周完成

3. **清理代码中的冗余字段**
   - **文件**: `types/User.d.ts`
   - **操作**: 删除 `userID`、`gamename`、`exp`、`loginCount`、`lastLoginTime`、`signIn` 字段
   - **预计工作量**: 15分钟
   - **理由**: 这些字段在数据库Schema中不存在，可能是历史遗留

### 优先级3（低）- 评估后决定

4. **评估是否需要添加缺失的数据库字段**
   - **文件**: `src/models/User/models/users.ts`
   - **操作**: 根据业务需求决定是否添加 `gamename`、`exp` 等字段
   - **预计工作量**: 30分钟
   - **理由**: 需要与产品/业务团队确认

---

## 🔧 修复代码示例

### 修复1：user_title 类型不匹配

**修改文件**: `src/models/User/models/users.ts`

**修改前**:
```typescript
user_title: {
    type: Array,
    default: []
}
```

**修改后**:
```typescript
user_title: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: "Title"  // 如果是引用Title表
}
```

---

### 修复2：添加缺失的类型定义

**修改文件**: `types/User.d.ts`

**修改前**:
```typescript
export interface UserBase extends Timestamps {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: UserSex;
    avatar: string;
    exp: number;
    status: UserStatus;
    role: UserRole;
    loginCount: number;
    lastLoginTime: Date;
    session_key: string;
    signIn: UserSignIn;
    permission: number;
}
```

**修改后**:
```typescript
export interface UserBase extends Timestamps {
    userId: number;
    userID: string;
    openId: string;
    user_title: Schema.Types.ObjectId[];
    nickname: string;
    gamename: string;
    sex: UserSex;
    avatar: string;
    exp: number;
    status: UserStatus;
    role: UserRole;
    loginCount: number;
    lastLoginTime: Date;
    session_key: string;
    signIn: UserSignIn;
    permission: number;
    
    // 新增字段（修复权限系统集成）
    roleIds: Schema.Types.ObjectId[];
    permissionsUpdatedAt?: Date;
}
```

---

## 📊 影响评估

### 数据一致性影响

| 影响类型 | 严重程度 | 影响范围 | 风险等级 |
|----------|----------|----------|----------|
| 类型不匹配 | 中等 | user_title字段使用 | 可能导致运行时错误 |
| 代码缺失字段 | 中等 | 权限系统功能 | TypeScript编译错误 |
| 数据库缺失字段 | 低等 | 统计功能 | 功能不可用 |

### 业务功能影响

| 功能模块 | 影响状态 | 说明 |
|----------|----------|------|
| 用户登录统计 | ⚠️ 受影响 | loginCount、lastLoginTime 字段缺失 |
| 游戏功能 | ⚠️ 受影响 | gamename、exp 字段缺失 |
| 权限系统 | ⚠️ 受影响 | roleIds、permissionsUpdatedAt 类型定义缺失 |
| 用户称号 | ⚠️ 受影响 | user_title 类型不匹配 |

---

## ✅ 验证清单

在执行修复后，请验证以下项目：

- [ ] TypeScript编译无错误
- [ ] 所有User相关的查询正常工作
- [ ] 用户登录功能正常
- [ ] 权限系统集成正常
- [ ] 用户称号功能正常
- [ ] 数据库索引正常工作
- [ ] 现有数据未丢失
- [ ] 新增字段可以正常读写

---

## 📋 后续行动项

1. **立即执行**（今天）
   - [ ] 修复 user_title 类型不匹配
   - [ ] 更新类型定义，添加 roleIds 和 permissionsUpdatedAt

2. **本周完成**（3天内）
   - [ ] 清理代码中的冗余字段
   - [ ] 评估是否需要添加缺失的数据库字段
   - [ ] 更新相关文档

3. **持续监控**（1个月内）
   - [ ] 监控TypeScript编译错误
   - [ ] 监控运行时错误日志
   - [ ] 收集用户反馈

---

## 📚 相关文件

### 需要修改的文件

1. `types/User.d.ts` - 用户类型定义
2. `src/models/User/models/users.ts` - 用户数据库Schema

### 相关参考文件

1. `src/models/permission/models/PermissionModel.ts` - 权限模型
2. `src/models/permission/models/RoleModel.ts` - 角色模型
3. `src/models/permission/models/UserRoleModel.ts` - 用户角色关联模型
4. `src/middlewares/auth.ts` - 认证中间件

---

## 🎯 总结

本次审计发现了 **3个主要问题**：

1. **类型不匹配**: user_title 字段类型定义与数据库Schema不一致
2. **代码缺失字段**: roleIds 和 permissionsUpdatedAt 在类型定义中缺失
3. **数据库缺失字段**: 6个字段在代码中定义但数据库Schema中不存在

**建议优先级**:
- 🔴 高优先级: 修复类型不匹配和代码缺失字段
- 🟡 中优先级: 清理代码中的冗余字段
- 🟢 低优先级: 评估是否需要添加缺失的数据库字段

**预计总工作量**: 约1小时

---

**审计完成时间**: 2024-01-15
**审计人员**: AI Assistant
