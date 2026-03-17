# Team创建指南

## 1. 概述

Team（队伍）是狼人杀小程序服务端中的核心模块，主要用于管理玩家数据、房间、聊天、游戏流程等功能。Team的创建主要发生在竞赛报名过程中，由系统自动创建。

## 2. Team创建入口

Team的创建主要通过`Teams`管理类的`createTeam`方法实现，该方法位于`src/models/Team/teams.ts`文件中。

```typescript
/**
 * 创建队伍
 */
static createTeam(options: {
    id?: number;
    name: string;
    leader: string;
    memberOps: PlayerAllocation;
    clan: Clan;
}): Team {
    const team = new Team(options);
    this.addTeam(team);
    return team;
}
```

## 3. Team创建所需参数

| 参数名 | 类型 | 说明 | 默认值 |
| ------ | ---- | ---- | ------ |
| id | number | 队伍ID | 1 |
| name | string | 队伍名称 | 必填 |
| leader | string | 队长名称 | 必填 |
| memberOps | PlayerAllocation | 成员配置 | `{ leader: 1, officialMember: 6, substitutes: 3 }` |
| clan | Clan | 所属家族 | 必填 |

### PlayerAllocation接口定义

```typescript
export interface PlayerAllocation {
    leader: number;
    officialMember: number;
    substitutes: number;
}
```

## 4. Team创建流程

### 4.1 竞赛报名场景下的Team创建

Team主要在竞赛报名过程中创建，具体流程如下：

1. **家族选择报名竞赛**：家族（Clan）选择报名某个竞赛
2. **生成队伍名称**：系统自动生成队伍名称，格式为：`${clan.name}${count + 1}`
3. **设置队伍队长**：默认设置家族领导者为队伍队长
4. **确定成员配置**：根据竞赛规则确定队伍的成员配置（memberOps）
5. **创建Team实例**：调用`Teams.createTeam()`方法创建Team实例
6. **添加到竞赛**：将创建的Team添加到竞赛的报名队伍列表中
7. **缓存基本信息**：将队伍基本信息缓存到Redis中，包括：
   - 队伍基本信息
   - 队伍成员
   - 队伍记录
   - 队伍晋级记录

### 4.2 直接创建Team的流程

除了竞赛报名场景外，也可以直接创建Team，具体流程如下：

1. **准备创建参数**：准备Team创建所需的各项参数
2. **调用创建方法**：调用`Teams.createTeam()`方法创建Team实例
3. **添加到Teams管理**：创建的Team会自动添加到`Teams.data` Map中管理
4. **缓存基本信息**：Team实例创建后会自动缓存基本信息到Redis

## 5. Team创建代码示例

### 5.1 在竞赛报名中创建Team

```typescript
// 竞赛报名时创建队伍
const teamName = `${clan.name}${count + 1}`;
const team = Teams.createTeam({
    id: count + 1,
    name: teamName,
    clan: clan,
    leader: clan.leader,
    memberOps: this.playerAllocation // 竞赛的成员配置
});

// 队伍创建后，添加到竞赛的报名队伍列表
this.signTeams.add(team);
```

### 5.2 直接创建Team

```typescript
// 导入所需模块
import Teams from '@/models/Team/teams';
import Clan from '@/models/clan/Clan';

// 创建家族实例
const clan = new Clan({
    name: '家族名称',
    leader: '家族领导者',
    members: new Map([['家族领导者', { nickName: '家族领导者' }]])
});

// 创建队伍
const team = Teams.createTeam({
    id: 1,
    name: '测试队伍',
    leader: '家族领导者',
    memberOps: {
        leader: 1,
        officialMember: 6,
        substitutes: 3
    },
    clan: clan
});

// 使用创建的队伍
console.log(team.name); // 输出：测试队伍
console.log(team.leader); // 输出：家族领导者
```

## 6. Team创建后的后续操作

### 6.1 队伍成员管理

Team创建后，可以通过以下方法管理成员：

```typescript
// 添加成员
team.join({ nickName: '成员1' });
team.join([{ nickName: '成员2' }, { nickName: '成员3' }]);

// 移除成员
team.leave({ nickName: '成员1' });

// 检查成员是否存在
team.has('成员1'); // 返回：true

// 检查是否为正式成员
team.isOfficialMember('成员1'); // 返回：true

// 检查是否为替补成员
team.isSubstituteMember('成员3'); // 返回：true
```

### 6.2 队伍比赛记录管理

```typescript
// 设置比赛记录
team.setRecord('2024-01-01', {
    startDay: '2024-01-01',
    endDay: '2024-01-02',
    schedule: []
});

// 获取比赛记录
team.getRecord('2024-01-01', 1);
```

### 6.3 队伍晋级记录管理

```typescript
// 添加晋级记录
team.addPromotionRecord({
    contestId: 'contest-001',
    contestName: '测试竞赛',
    stage: '初赛',
    promotionStatus: 'promoted',
    rank: 1,
    updatedAt: new Date()
});

// 获取特定竞赛的晋级记录
team.getPromotionRecordsByContest('contest-001');
```

## 7. Team与其他模块的关系

### 7.1 与家族（Clan）的关系

- 队伍属于某个家族，通过`clan`属性关联
- 家族领导者默认为队伍队长
- 可以通过家族获取其所属的所有队伍：`Teams.getTeamsByClan(clan)`或`Teams.getTeamsByClanName(clanName)`

### 7.2 与竞赛（Contest）的关系

- 队伍可以报名参加竞赛
- 竞赛记录队伍的比赛结果和晋级情况
- 竞赛通过`signTeams`属性管理报名的队伍

### 7.3 与数据库的关系

- 队伍报名信息通过`ContestTeamRegistrationModel`持久化到MongoDB
- 包含字段：contestId、teamId、teamName、leaderId、clanId、members等

### 7.4 与Redis的关系

- 队伍基本信息、成员、记录和晋级记录会缓存到Redis
- 提高查询性能，减少数据库压力
- 缓存键格式：
  - 队伍基本信息：`team:${teamName}:info`
  - 队伍成员：`team:${teamName}:members`
  - 队伍记录：`team:${teamName}:records`
  - 队伍晋级记录：`team:${teamName}:promotionRecords`

## 8. Team查询和管理

Teams管理类提供了以下方法用于查询和管理Team：

| 方法名 | 说明 | 参数 | 返回值 |
| ------ | ---- | ---- | ------ |
| getAllTeams() | 获取所有队伍 | 无 | Team[] |
| getTeamByName(teamName) | 根据名称获取队伍 | teamName: string | Team | undefined |
| getTeamsByClan(clan) | 根据家族获取队伍 | clan: Clan | Team[] |
| getTeamsByClanName(clanName) | 根据家族名称获取队伍 | clanName: string | Team[] |
| getTeamsByMember(nickName) | 根据成员获取队伍 | nickName: string | Team[] |
| removeTeam(teamName) | 移除队伍 | teamName: string | void |
| getTeamCount() | 获取队伍数量 | 无 | number |
| getAllTeamNames() | 获取所有队伍名称 | 无 | string[] |

## 9. 注意事项

1. **队伍名称唯一性**：队伍名称在系统中应该保持唯一，避免重复创建同名队伍
2. **成员数量限制**：队伍成员数量不能超过`memberOps.officialMember + memberOps.substitutes`
3. **队长权限**：队长拥有队伍的管理权限，如添加/移除成员等
4. **Redis缓存**：队伍信息会缓存到Redis，有效期为1小时，更新队伍信息时会自动刷新缓存
5. **与家族的关联**：队伍必须属于某个家族，不能独立存在

## 10. 常见问题

### 10.1 如何修改队伍名称？

目前Team模型中没有提供直接修改队伍名称的方法，因为队伍名称在创建后通常不会轻易改变。如果需要修改队伍名称，建议：

1. 创建一个新的队伍，使用新名称
2. 将原队伍的成员、记录等迁移到新队伍
3. 删除原队伍

### 10.2 如何修改队伍队长？

目前Team模型中没有提供直接修改队伍队长的方法。如果需要修改队长，建议：

1. 创建一个新的队伍，使用新队长
2. 将原队伍的成员、记录等迁移到新队伍
3. 删除原队伍

### 10.3 如何查询队伍的比赛记录？

可以使用`team.getRecord(date, round)`方法查询特定日期和轮次的比赛记录，或直接访问`team.records`属性获取所有记录。

### 10.4 如何查询队伍的晋级状态？

可以使用`team.getPromotionRecordsByContest(contestId)`方法查询特定竞赛的晋级记录，或直接访问`team.promotionRecords`属性获取所有晋级记录。

## 11. 总结

Team是狼人杀小程序服务端中的核心模块，用于管理玩家数据、房间、聊天、游戏流程等功能。Team的创建主要发生在竞赛报名过程中，由系统自动创建，也可以直接通过`Teams.createTeam()`方法创建。

Team创建后，会自动添加到Teams管理类中管理，并缓存基本信息到Redis。Team与家族、竞赛等模块紧密关联，共同构成了狼人杀小程序的核心功能。

通过本指南，你应该已经了解了Team的创建流程、所需参数、与其他模块的关系以及常见问题的解决方案。在实际开发中，可以根据具体需求灵活使用Team模块的各项功能。