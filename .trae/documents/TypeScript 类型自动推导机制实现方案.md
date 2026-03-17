# TypeScript 类型自动推导机制实现方案

## 📋 问题分析

### 当前项目类型定义存在的问题

1. **类型重复和硬编码**

   * 状态类型在多个接口中重复定义（如 `"active" | "expired" | "revoked"`）

   * 基础类型变更时，派生类型不会自动同步

   * 使用 `Pick` 和 `Partial` 工具类型，但缺乏自动推导

2. **类型解耦不足**

   * `IUserTitle`、`IClanTitle`、`ITitleGrantRecord` 都有 `metadata` 字段，但没有统一基础类型

   * WebSocket 消息类型的 `content` 字段重复定义

3. **缺乏类型推导机制**

   * 未使用条件类型、映射类型等高级特性

   * 未利用 `infer` 关键字进行类型推导

   * 未使用模板字面量类型进行类型约束

***

## 🎯 实现方案

### 1. 创建基础类型系统（`types/base-types.d.ts`）

#### 1.1 通用状态类型

```typescript
export type Status = "active" | "inactive" | "expired" | "revoked" | "pending" | "granted";

export type EntityStatus = {
    user: 0 | 1 | 2 | 3;
    wallet: 0 | 1;
    transaction: 0 | 1 | 2;
    contest: 0 | 1 | 2 | 3 | 4 | 5;
};
```

#### 1.2 通用时间戳类型

```typescript
export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface OptionalTimestamps {
    createdAt?: Date;
    updatedAt?: Date;
}
```

#### 1.3 通用元数据类型

```typescript
export interface Metadata {
    [key: string]: unknown;
}

export type WithMetadata<T> = T & { metadata?: Metadata };
```

#### 1.4 通用 ID 类型

```typescript
export type EntityId = string | number;

export interface WithId {
    id: EntityId;
}

export type WithId<T> = T & WithId;
```

***

### 2. 实现类型推导工具（`types/type-utils.d.ts`）

#### 2.1 从基础类型推导状态类型

```typescript
export type StatusFromBase<T extends string> = T extends `${infer _Status}` 
    ? T 
    : never;

export type ExtractStatuses<T> = T extends { status: infer S } 
    ? S 
    : never;
```

#### 2.2 条件类型推导

```typescript
export type ConditionalType<T, Condition, TrueType, FalseType> = 
    T extends Condition 
        ? TrueType 
        : FalseType;

export type IfHasProperty<T, K extends PropertyKey> = 
    K extends keyof T 
        ? true 
        : false;
```

#### 2.3 映射类型

```typescript
export type PartialBy<T, K extends keyof T> = 
    Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = 
    Pick<T, Exclude<keyof T, K>> & Required<Pick<T, K>>;
```

#### 2.4 类型守卫工具

```typescript
export type IsNever<T> = [T] extends [never] ? true : false;

export type IsAny<T> = 0 extends (1 & T) ? true : false;

export type IsUnknown<T> = IsNever<T> extends false 
    ? IsAny<T> extends false 
        ? true 
        : false 
    : false;
```

***

### 3. 重构现有类型

#### 3.1 Title 模块类型重构

**创建基础类型：**

```typescript
export type TitleStatus = "active" | "inactive" | "expired" | "pending";

export type TitleRarity = "common" | "rare" | "epic" | "legendary";

export type TitleType = "achievement" | "honor" | "activity" | "season" | "clan" | "special" | "custom" | "system";

export interface TitleBase extends Timestamps {
    id: string;
    title: string;
    description: string;
    type: TitleType;
    image?: string;
    status: TitleStatus;
    expiredAt?: Date;
    conditions: TitleCondition;
    category: string;
    rarity: TitleRarity;
    isTimeLimited: boolean;
}
```

**使用类型推导创建派生类型：**

```typescript
export type ITitle = TitleBase & Document;

export type UserTitleStatus = "active" | "equipped" | "expired" | "revoked";

export type ClanTitleStatus = "active" | "expired" | "revoked";

export interface UserTitleBase extends Timestamps, WithMetadata {
    userId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: UserTitleStatus;
    equipped: boolean;
    revokedAt?: Date;
}

export interface ClanTitleBase extends Timestamps, WithMetadata {
    clanId: mongoose.Types.ObjectId;
    titleId: mongoose.Types.ObjectId;
    obtainedAt: Date;
    status: ClanTitleStatus;
    revokedAt?: Date;
}

export type IUserTitle = UserTitleBase & Document;
export type IClanTitle = ClanTitleBase & Document;
```

#### 3.2 WebSocket 消息类型重构

**创建基础消息类型：**

```typescript
export interface MessageBase<T extends MessageType = MessageType> {
    type: T;
    content: Record<string, unknown>;
    senderId?: string;
    receiverId?: string;
    timestamp?: number;
    roomId?: string;
    messageId?: string;
}

export type Message<T extends MessageType = MessageType> = MessageBase<T>;
```

**使用类型推导创建特定消息类型：**

```typescript
export type ChatContent = {
    text: string;
    images?: string[];
    emojis?: string[];
};

export type GameActionContent = {
    action: string;
    data: Record<string, unknown>;
};

export type SystemNotificationContent = {
    title: string;
    message: string;
    data?: Record<string, unknown>;
};

export type UserStatusContent = {
    userId: string;
    status: string;
    data?: Record<string, unknown>;
};

export type GameStatusContent = {
    gameId: string;
    status: string;
    data?: Record<string, unknown>;
};

export type ChatMessage = Message<MessageType.CHAT> & { content: ChatContent };
export type GameActionMessage = Message<MessageType.GAME_ACTION> & { content: GameActionContent };
export type SystemNotificationMessage = Message<MessageType.SYSTEM_NOTIFICATION> & { content: SystemNotificationContent };
export type UserStatusMessage = Message<MessageType.USER_STATUS> & { content: UserStatusContent };
export type GameStatusMessage = Message<MessageType.GAME_STATUS> & { content: GameStatusContent };
```

#### 3.3 User 模块类型重构

**创建基础用户类型：**

```typescript
export type UserStatus = 0 | 1 | 2 | 3;
export type UserRole = 0 | 1 | 2;
export type UserSex = 0 | 1 | 2;

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
    signIn: {
        signInDays: number;
        lastSignInTime: Date;
    };
    permission: number;
}

export type IUser = UserBase & Document;

export type TUserFind = Partial<Pick<UserBase, "nickname" | "gamename" | "userId" | "userID" | "openId" | "session_key">>;
export type UserType = Partial<Pick<UserBase, "nickname" | "gamename" | "avatar" | "status" | "role" | "sex" | "openId" | "session_key">>;
export type UserBasicInfo = Partial<Pick<UserBase, "nickname" | "gamename" | "avatar" | "sex">>;
```

***

### 4. 创建类型约束和验证工具

#### 4.1 类型约束

```typescript
export type Strict<T, U> = T & { [K in keyof T]: K extends keyof U ? T[K] : never };

export type Exact<T, Shape> = Strict<T, Shape> & Record<Exclude<keyof T, keyof Shape>, never>;
```

#### 4.2 类型推导验证

```typescript
export type ValidateType<T, Expected> = 
    T extends Expected 
        ? Expected extends T 
            ? true 
            : false 
        : false;
```

***

### 5. 更新 TypeScript 配置

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

***

### 6. 创建类型测试文件（`types/__tests__/type-utils.test.ts`）

```typescript
import { describe, it, expect } from "vitest";
import type { 
    ExtractStatuses, 
    ConditionalType, 
    IfHasProperty,
    PartialBy,
    RequiredBy 
} from "../type-utils";

describe("Type Utils", () => {
    it("should extract status from base type", () => {
        type TestType = { status: "active" | "inactive" };
        type Status = ExtractStatuses<TestType>;
        
        const status: Status = "active";
        expect(status).toBe("active");
    });

    it("should work with conditional types", () => {
        type Result = ConditionalType<string, string, "yes", "no">;
        
        const result: Result = "yes";
        expect(result).toBe("yes");
    });

    it("should check if property exists", () => {
        type HasName = IfHasProperty<{ name: string }, "name">;
        type HasAge = IfHasProperty<{ name: string }, "age">;
        
        const hasName: HasName = true;
        const hasAge: HasAge = false;
        
        expect(hasName).toBe(true);
        expect(hasAge).toBe(false);
    });

    it("should make properties partial", () => {
        type TestType = { name: string; age: number; email: string };
        type Result = PartialBy<TestType, "age" | "email">;
        
        const result: Result = { name: "test" };
        expect(result.name).toBe("test");
    });

    it("should make properties required", () => {
        type TestType = { name: string; age?: number; email?: string };
        type Result = RequiredBy<TestType, "age" | "email">;
        
        const result: Result = { name: "test", age: 25, email: "test@example.com" };
        expect(result.age).toBe(25);
    });
});
```

***

## 📁 文件结构

```
types/
├── base-types.d.ts          # 基础类型定义
├── type-utils.d.ts         # 类型推导工具
├── User.d.ts              # 用户类型（重构）
├── websocketType.d.ts      # WebSocket 类型（重构）
├── Reward.d.ts            # 奖励类型（重构）
├── Item.d.ts              # 物品类型（重构）
├── Game.d.ts              # 游戏类型（重构）
├── ChatType.d.ts          # 聊天类型（重构）
├── RoomName.d.ts         # 房间类型（重构）
├── TimeUnit.d.ts          # 时间单位类型（重构）
├── Room/
│   └── room.d.ts         # 房间类型（重构）
└── __tests__/
    └── type-utils.test.ts  # 类型工具测试
```

***

## 🎯 实现目标

1. ✅ 类型 A 和类型 B 都基于基础类型 C 进行类型推导
2. ✅ 基础类型 C 变更时，类型 A 和 B 自动同步更新
3. ✅ 避免硬编码类型定义
4. ✅ 充分利用 TypeScript 的类型推断特性
5. ✅ 确保类型系统的灵活性和可维护性

***

## 📝 实施步骤

1. 创建 `types/base-types.d.ts` - 定义基础类型系统
2. 创建 `types/type-utils.d.ts` - 实现类型推导工具
3. 重构 `TitleModel.ts` - 使用新的类型系统
4. 重构 `websocketType.d.ts` - 使用类型推导
5. 重构 `User.d.ts` - 使用类型推导
6. 重构其他类型文件 - 应用相同的模式
7. 更新 `tsconfig.json` - 添加严格类型检查
8. 创建类型测试文件 - 验证类型推导
9. 运行类型检查 - 确保没有错误
10. 提交代码并推送

***

## ✅ 预期效果

* **类型安全性提升**：编译时捕获更多类型错误

* **代码可维护性提升**：类型变更自动同步

* **开发效率提升**：减少重复类型定义

* **代码可读性提升**：类型定义更清晰

