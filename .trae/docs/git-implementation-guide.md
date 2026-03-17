# Git 分支实施指导

## 概述

本文档提供从当前Git仓库状态迁移到新的分支管理策略的详细步骤和指导。

---

## 一、当前状态分析

### 1.1 当前Git状态

```bash
# 检查当前状态
git status

# 输出：
# No commits yet
# Untracked files: (所有文件都未跟踪)
```

**状态说明：**
- ✅ Git仓库已初始化
- ❌ 尚未进行首次提交
- ❌ 所有文件都处于未跟踪状态
- ❌ 无任何分支存在

### 1.2 实施目标

1. 完成首次提交，建立main分支
2. 创建develop分支
3. 为每个模块创建独立的feature分支
4. 合并已完成的模块到develop
5. 为Room和Game模块创建调试分支
6. 配置分支保护规则

---

## 二、实施步骤

### 步骤1：初始化Git仓库

#### 2.1.1 检查.gitignore配置

```bash
# 确认.gitignore文件已正确配置
cat .gitignore

# 应该包含：
# - node_modules/
# - dist/
# - .env
# - logs/
# - coverage/
# 等等
```

#### 2.1.2 添加所有文件到Git

```bash
# 添加所有文件（排除.gitignore中指定的文件）
git add .

# 查看暂存状态
git status

# 应该看到：
# Changes to be committed:
#   new file:   package.json
#   new file:   tsconfig.json
#   ... 其他文件
```

#### 2.1.3 创建首次提交

```bash
# 创建首次提交
git commit -m "chore: 初始化项目

- 初始化狼人杀小程序服务端项目
- 配置TypeScript开发环境
- 配置Webpack构建工具
- 配置Jest测试框架
- 添加项目文档

Closes #init"
```

#### 2.1.4 重命名默认分支为main

```bash
# 查看当前分支
git branch

# 如果默认分支是master，重命名为main
git branch -M main

# 查看分支
git branch
# 输出: * main
```

#### 2.1.5 推送到远程仓库

```bash
# 添加远程仓库（如果还没有）
git remote add origin <your-repository-url>

# 推送到远程
git push -u origin main

# 示例：
# git remote add origin https://github.com/username/myServer-2.git
# git push -u origin main
```

**验证：**
```bash
# 查看远程分支
git branch -r

# 应该看到：
# origin/main
```

---

### 步骤2：创建develop分支

```bash
# 从main创建develop分支
git checkout -b develop

# 推送到远程
git push -u origin develop

# 验证分支
git branch -a
```

**说明：**
- develop分支是开发主分支
- 所有已完成的feature分支都会合并到develop
- develop分支应该始终保持可运行状态

---

### 步骤3：创建模块feature分支

#### 3.1 为已完成模块创建feature分支

```bash
# 确保在develop分支
git checkout develop
git pull origin develop

# 为每个已完成模块创建feature分支
git checkout -b feature/user
git push -u origin feature/user

git checkout develop
git checkout -b feature/clan
git push -u origin feature/clan

git checkout develop
git checkout -b feature/contest
git push -u origin feature/contest

git checkout develop
git checkout -b feature/countdown
git push -u origin feature/countdown

git checkout develop
git checkout -b feature/currency
git push -u origin feature/currency

git checkout develop
git checkout -b feature/goods
git push -u origin feature/goods

git checkout develop
git checkout -b feature/team
git push -u origin feature/team

git checkout develop
git checkout -b feature/title
git push -u origin feature/title
```

**说明：**
- 这些分支当前与develop分支内容相同
- 后续可以在这些分支上进行模块的独立开发
- 也可以直接合并到develop（因为已完成）

#### 3.2 为调试中模块创建feature分支

```bash
# Room模块调试分支
git checkout develop
git checkout -b feature/room
git push -u origin feature/room

# Game模块调试分支
git checkout develop
git checkout -b feature/game
git push -u origin feature/game
```

**说明：**
- Room和Game模块需要独立调试环境
- 可以在这些分支上进行调试，不影响develop分支
- 调试完成后合并回develop

#### 3.3 为开发中模块创建feature分支

```bash
# Announcement模块
git checkout develop
git checkout -b feature/announcement
git push -u origin feature/announcement

# Reward模块
git checkout develop
git checkout -b feature/reward
git push -u origin feature/reward

# Active模块
git checkout develop
git checkout -b feature/active
git push -u origin feature/active
```

**说明：**
- 这些模块正在开发中
- 需要与主分支保持隔离
- 开发完成后再合并到develop

---

### 步骤4：合并已完成的模块到develop

由于所有feature分支当前内容与develop相同，可以立即合并：

```bash
# 切换到develop分支
git checkout develop
git pull origin develop

# 合并所有已完成的feature分支
git merge feature/user --no-ff -m "feat: 合并User模块"
git merge feature/clan --no-ff -m "feat: 合并clan模块"
git merge feature/contest --no-ff -m "feat: 合并contest模块"
git merge feature/countdown --no-ff -m "feat: 合并CountDown模块"
git merge feature/currency --no-ff -m "feat: 合并currency模块"
git merge feature/goods --no-ff -m "feat: 合并goods模块"
git merge feature/team --no-ff -m "feat: 合并Team模块"
git merge feature/title --no-ff -m "feat: 合并Title模块"

# 推送到远程
git push origin develop
```

**说明：**
- `--no-ff` 参数确保创建合并提交，保留历史记录
- 合并提交信息清晰说明合并了哪个模块
- 合并后develop分支包含所有已完成模块的代码

---

### 步骤5：配置Room和Game模块的独立调试环境

#### 5.1 创建独立配置文件

在feature/room分支中创建独立配置：

```bash
# 切换到Room分支
git checkout feature/room

# 创建Room模块的独立配置文件
# 可以修改环境变量或配置文件指向独立的数据库

# 示例：创建 .env.room
cat > .env.room << EOF
# Room模块独立配置
NODE_ENV=development
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1
MONGODB_URI=mongodb://localhost:27017/werewolf_room_test
EOF

# 提交配置
git add .env.room
git commit -m "chore(room): 添加Room模块独立配置"
git push origin feature/room
```

在feature/game分支中创建独立配置：

```bash
# 切换到Game分支
git checkout feature/game

# 创建Game模块的独立配置文件
cat > .env.game << EOF
# Game模块独立配置
NODE_ENV=development
PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2
MONGODB_URI=mongodb://localhost:27017/werewolf_game_test
EOF

# 提交配置
git add .env.game
git commit -m "chore(game): 添加Game模块独立配置"
git push origin feature/game
```

#### 5.2 创建调试脚本

在feature/room分支中：

```bash
# 创建调试启动脚本
cat > scripts/debug-room.sh << 'EOF'
#!/bin/bash
# 加载Room模块配置
export $(cat .env.room | xargs)
# 启动调试服务器
pnpm run dev:hot
EOF

chmod +x scripts/debug-room.sh

git add scripts/debug-room.sh
git commit -m "chore(room): 添加Room模块调试脚本"
git push origin feature/room
```

在feature/game分支中：

```bash
# 创建调试启动脚本
cat > scripts/debug-game.sh << 'EOF'
#!/bin/bash
# 加载Game模块配置
export $(cat .env.game | xargs)
# 启动调试服务器
pnpm run dev:hot
EOF

chmod +x scripts/debug-game.sh

git add scripts/debug-game.sh
git commit -m "chore(game): 添加Game模块调试脚本"
git push origin feature/game
```

---

### 步骤6：配置分支保护规则

#### 6.1 在GitHub上配置分支保护

1. **进入仓库设置**
   - 打开GitHub仓库
   - 点击 "Settings" 标签
   - 选择 "Branches"

2. **配置main分支保护**
   - 点击 "Add rule"
   - Branch name pattern: `main`
   - 勾选以下选项：
     - ✅ Require a pull request before merging
     - ✅ Require approvals: 1
     - ✅ Dismiss stale PR approvals when new commits are pushed
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
   - 添加必需的状态检查：
     - `lint`
     - `typecheck`
     - `test`
   - 点击 "Create" 或 "Save changes"

3. **配置develop分支保护**
   - 点击 "Add rule"
   - Branch name pattern: `develop`
   - 勾选相同的选项
   - 添加相同的状态检查
   - 点击 "Create" 或 "Save changes"

#### 6.2 配置CI/CD（可选）

创建 `.github/workflows/ci.yml` 文件：

```yaml
name: CI

on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8

    - name: Install dependencies
      run: pnpm install

    - name: Run type check
      run: pnpm run typecheck

    - name: Run lint
      run: pnpm run lint

    - name: Run tests
      run: pnpm run test

    - name: Build
      run: pnpm run build
```

提交CI配置：

```bash
git checkout develop
git add .github/workflows/ci.yml
git commit -m "ci: 添加CI/CD配置"
git push origin develop
```

---

### 步骤7：创建Pull Request模板

创建 `.github/pull_request_template.md` 文件：

```markdown
## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug修复 (fix)
- [ ] 代码重构 (refactor)
- [ ] 文档更新 (docs)
- [ ] 性能优化 (perf)
- [ ] 其他 (chore)

## 变更描述
<!-- 简要描述本次PR的主要变更内容 -->

## 相关Issue
<!-- 关联的Issue编号，如：Closes #123 -->

## 测试情况
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过
- [ ] 代码检查通过 (pnpm run lint)
- [ ] 类型检查通过 (pnpm run typecheck)

## 截图或演示
<!-- 如果是UI变更，请提供截图或GIF -->

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 无console.log或调试代码
- [ ] 无敏感信息泄露
```

提交模板：

```bash
git checkout develop
git add .github/pull_request_template.md
git commit -m "docs: 添加Pull Request模板"
git push origin develop
```

---

### 步骤8：创建环境变量示例文件

创建 `.env.example` 文件：

```bash
cat > .env.example << 'EOF'
# 服务器配置
NODE_ENV=development
PORT=3000

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/werewolf

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=your-appid
WECHAT_SECRET=your-secret

# 其他配置
# ...
EOF

git add .env.example
git commit -m "chore: 添加环境变量示例文件"
git push origin develop
```

---

## 三、验证实施结果

### 3.1 检查分支结构

```bash
# 查看所有分支
git branch -a

# 应该看到：
# * develop
#   main
#   remotes/origin/main
#   remotes/origin/develop
#   remotes/origin/feature/user
#   remotes/origin/feature/clan
#   remotes/origin/feature/contest
#   remotes/origin/feature/countdown
#   remotes/origin/feature/currency
#   remotes/origin/feature/goods
#   remotes/origin/feature/team
#   remotes/origin/feature/title
#   remotes/origin/feature/room
#   remotes/origin/feature/game
#   remotes/origin/feature/announcement
#   remotes/origin/feature/reward
#   remotes/origin/feature/active
```

### 3.2 检查提交历史

```bash
# 查看提交历史
git log --oneline --graph --all

# 应该看到清晰的分支结构
```

### 3.3 验证分支保护

1. 尝试直接推送到main分支（应该被拒绝）：
   ```bash
   git checkout main
   echo "test" >> test.txt
   git add test.txt
   git commit -m "test: 测试分支保护"
   git push origin main
   # 应该失败，提示需要Pull Request
   ```

2. 创建Pull Request测试：
   - 在GitHub上创建PR
   - 检查CI/CD是否运行
   - 检查是否需要审查批准

---

## 四、日常开发工作流程

### 4.1 开始新功能开发

```bash
# 1. 确保develop分支最新
git checkout develop
git pull origin develop

# 2. 创建新的feature分支
git checkout -b feature/<module-name>

# 3. 开发功能
# ... 编写代码 ...

# 4. 提交代码
git add .
git commit -m "feat(module): 描述"

# 5. 推送到远程
git push -u origin feature/<module-name>

# 6. 创建Pull Request
# 在GitHub上创建PR到develop分支
```

### 4.2 调试Room模块

```bash
# 1. 切换到Room分支
git checkout feature/room
git pull origin feature/room

# 2. 使用独立配置启动
source .env.room
pnpm run dev:hot

# 或使用调试脚本
./scripts/debug-room.sh
```

### 4.3 调试Game模块

```bash
# 1. 切换到Game分支
git checkout feature/game
git pull origin feature/game

# 2. 使用独立配置启动
source .env.game
pnpm run dev:hot

# 或使用调试脚本
./scripts/debug-game.sh
```

### 4.4 同步develop分支到feature分支

```bash
# 1. 切换到develop分支
git checkout develop
git pull origin develop

# 2. 切换到feature分支
git checkout feature/<module-name>

# 3. 合并develop的更新
git merge develop

# 或使用rebase（保持线性历史）
git rebase develop

# 4. 解决冲突（如果有）
# ... 手动解决冲突 ...

# 5. 推送到远程
git push origin feature/<module-name>
```

---

## 五、故障排查

### 5.1 问题：无法推送分支

**症状：**
```bash
git push origin feature/room
# 错误：Updates were rejected because the tip of your current branch is behind
```

**解决方案：**
```bash
# 拉取最新代码
git pull origin feature/room

# 或使用fetch + rebase
git fetch origin
git rebase origin/feature/room

# 再次推送
git push origin feature/room
```

### 5.2 问题：合并冲突

**症状：**
```bash
git merge develop
# CONFLICT (content): Merge conflict in src/index.ts
```

**解决方案：**
```bash
# 1. 查看冲突文件
git status

# 2. 编辑冲突文件，手动解决
# 标记冲突内容：
# <<<<<<< HEAD
# 你的代码
# =======
# develop的代码
# >>>>>>> develop

# 3. 标记冲突已解决
git add <conflicted-file>

# 4. 完成合并
git commit

# 5. 测试代码
pnpm run test
pnpm run typecheck

# 6. 推送
git push origin feature/<module-name>
```

### 5.3 问题：分支丢失

**症状：**
```bash
git branch
# 找不到某个分支
```

**解决方案：**
```bash
# 1. 查看reflog
git reflog

# 2. 找到分支的commit hash
# 例如：a1b2c3d feature/room

# 3. 恢复分支
git branch feature/room a1b2c3d
```

### 5.4 问题：误删分支

**症状：**
```bash
git branch -d feature/room
# 错误：不小心删除了分支
```

**解决方案：**
```bash
# 1. 从远程恢复
git fetch origin

# 2. 重新创建分支
git checkout -b feature/room origin/feature/room
```

---

## 六、最佳实践

### 6.1 日常习惯

- ✅ 每天开始工作前同步develop分支
- ✅ 频繁提交代码，小步快跑
- ✅ 提交前运行测试和代码检查
- ✅ 使用有意义的提交信息
- ✅ 及时删除已合并的分支
- ✅ 定期清理无用分支

### 6.2 团队协作

- ✅ 所有代码必须通过代码审查
- ✅ 及时响应审查意见
- ✅ 保持开放和建设性的态度
- ✅ 遵循项目代码规范
- ✅ 及时更新相关文档

### 6.3 安全注意事项

- ✅ 永远不要提交敏感信息
- ✅ 使用环境变量管理配置
- ✅ 定期审查.gitignore配置
- ✅ 使用分支保护规则
- ✅ 定期更新依赖包

---

## 七、检查清单

### 7.1 实施完成检查

- [ ] Git仓库已初始化
- [ ] main分支已创建并推送到远程
- [ ] develop分支已创建并推送到远程
- [ ] 所有feature分支已创建
- [ ] 已完成模块已合并到develop
- [ ] Room和Game模块有独立配置
- [ ] 分支保护规则已配置
- [ ] CI/CD已配置（可选）
- [ ] Pull Request模板已创建
- [ ] 环境变量示例文件已创建
- [ ] .gitignore配置完整
- [ ] 团队成员已了解分支策略

### 7.2 日常开发检查

- [ ] 开发前已同步develop分支
- [ ] 使用独立的feature分支
- [ ] 提交前已运行测试
- [ ] 提交信息符合规范
- [ ] 已创建Pull Request
- [ ] 代码已通过审查
- [ ] 合并后已删除feature分支

---

## 八、后续维护

### 8.1 定期任务

**每周：**
- 清理已合并的本地分支
- 同步远程分支状态
- 检查分支保护规则

**每月：**
- 审查和更新.gitignore配置
- 检查CI/CD配置
- 更新文档

**每季度：**
- 评估分支策略效果
- 收集团队反馈
- 优化工作流程

### 8.2 文档更新

- 新增分支类型时更新文档
- 修改工作流程时更新文档
- 发现问题时更新故障排查部分
- 收集最佳实践并更新文档

---

## 附录

### A. 快速命令参考

```bash
# 初始化仓库
git init
git add .
git commit -m "chore: 初始化项目"
git branch -M main
git push -u origin main

# 创建develop分支
git checkout -b develop
git push -u origin develop

# 创建feature分支
git checkout develop
git checkout -b feature/<module-name>
git push -u origin feature/<module-name>

# 合并分支
git checkout develop
git merge feature/<module-name> --no-ff
git push origin develop

# 删除分支
git branch -d feature/<module-name>
git push origin --delete feature/<module-name>

# 同步分支
git checkout develop
git pull origin develop
git checkout feature/<module-name>
git merge develop
```

### B. 相关资源

- [Git官方文档](https://git-scm.com/doc)
- [GitHub分支保护](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [项目分支策略文档](./git-branch-strategy.md)

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-08
**维护者**: 开发团队
