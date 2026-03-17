# Git 分支操作快速参考

## 概述

本文档提供Git分支操作的快速参考，方便开发者日常使用。

---

## 一、常用命令速查

### 1.1 分支操作

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 创建新分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换到新分支
git checkout -b <branch-name>

# 删除本地分支
git branch -d <branch-name>

# 强制删除本地分支
git branch -D <branch-name>

# 删除远程分支
git push origin --delete <branch-name>

# 重命名分支
git branch -m <old-name> <new-name>

# 查看分支详情
git branch -v
git branch -vv
```

### 1.2 提交操作

```bash
# 查看状态
git status

# 添加所有文件
git add .

# 添加指定文件
git add <file-name>

# 提交
git commit -m "message"

# 修改最后一次提交
git commit --amend

# 查看提交历史
git log
git log --oneline
git log --graph --all
```

### 1.3 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <url>

# 推送到远程
git push origin <branch-name>

# 首次推送并设置上游
git push -u origin <branch-name>

# 拉取远程更新
git pull origin <branch-name>

# 获取远程更新但不合并
git fetch origin
```

### 1.4 合并操作

```bash
# 合并分支
git merge <branch-name>

# 合并但不创建合并提交（快进）
git merge --ff <branch-name>

# 合并并创建合并提交
git merge --no-ff <branch-name>

# 中止合并
git merge --abort

# 继续合并（解决冲突后）
git merge --continue
```

### 1.5 变基操作

```bash
# 变基到指定分支
git rebase <branch-name>

# 交互式变基
git rebase -i HEAD~3

# 继续变基（解决冲突后）
git rebase --continue

# 跳过当前提交
git rebase --skip

# 中止变基
git rebase --abort
```

---

## 二、项目特定操作

### 2.1 初始化项目

```bash
# 1. 初始化Git仓库
git init

# 2. 添加所有文件
git add .

# 3. 首次提交
git commit -m "chore: 初始化项目"

# 4. 重命名分支为main
git branch -M main

# 5. 添加远程仓库
git remote add origin <repository-url>

# 6. 推送到远程
git push -u origin main
```

### 2.2 创建develop分支

```bash
# 从main创建develop
git checkout main
git checkout -b develop

# 推送到远程
git push -u origin develop
```

### 2.3 创建feature分支

```bash
# 从develop创建feature分支
git checkout develop
git pull origin develop
git checkout -b feature/<module-name>

# 推送到远程
git push -u origin feature/<module-name>
```

### 2.4 合并feature分支到develop

```bash
# 切换到develop
git checkout develop
git pull origin develop

# 合并feature分支
git merge feature/<module-name> --no-ff

# 推送到远程
git push origin develop

# 删除已合并的feature分支
git branch -d feature/<module-name>
git push origin --delete feature/<module-name>
```

### 2.5 同步develop到feature分支

```bash
# 切换到feature分支
git checkout feature/<module-name>

# 合并develop的更新
git merge develop

# 或使用rebase（保持线性历史）
git rebase develop

# 推送到远程
git push origin feature/<module-name>
```

---

## 三、模块特定操作

### 3.1 User模块

```bash
# 创建User模块分支
git checkout develop
git checkout -b feature/user
git push -u origin feature/user

# 开发完成后合并
git checkout develop
git merge feature/user --no-ff -m "feat: 合并User模块"
git push origin develop

# 删除分支
git branch -d feature/user
git push origin --delete feature/user
```

### 3.2 clan模块

```bash
# 创建clan模块分支
git checkout develop
git checkout -b feature/clan
git push -u origin feature/clan

# 开发完成后合并
git checkout develop
git merge feature/clan --no-ff -m "feat: 合并clan模块"
git push origin develop

# 删除分支
git branch -d feature/clan
git push origin --delete feature/clan
```

### 3.3 contest模块

```bash
# 创建contest模块分支
git checkout develop
git checkout -b feature/contest
git push -u origin feature/contest

# 开发完成后合并
git checkout develop
git merge feature/contest --no-ff -m "feat: 合并contest模块"
git push origin develop

# 删除分支
git branch -d feature/contest
git push origin --delete feature/contest
```

### 3.4 Room模块（调试分支）

```bash
# 创建Room模块调试分支
git checkout develop
git checkout -b feature/room
git push -u origin feature/room

# 使用独立配置调试
source .env.room
pnpm run dev:hot

# 或使用调试脚本
./scripts/debug-room.sh
```

### 3.5 Game模块（调试分支）

```bash
# 创建Game模块调试分支
git checkout develop
git checkout -b feature/game
git push -u origin feature/game

# 使用独立配置调试
source .env.game
pnpm run dev:hot

# 或使用调试脚本
./scripts/debug-game.sh
```

---

## 四、日常开发流程

### 4.1 开始新功能开发

```bash
# 1. 同步develop分支
git checkout develop
git pull origin develop

# 2. 创建feature分支
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

### 4.2 日常开发提交

```bash
# 查看状态
git status

# 添加修改的文件
git add .

# 提交
git commit -m "feat(module): 简短描述

- 详细说明1
- 详细说明2

Closes #issue-id"

# 推送
git push origin feature/<module-name>
```

### 4.3 提交前检查

```bash
# 1. 类型检查
pnpm run typecheck

# 2. 代码检查
pnpm run lint

# 3. 运行测试
pnpm run test

# 4. 构建项目
pnpm run build

# 5. 查看状态
git status

# 6. 提交
git add .
git commit -m "feat(module): 描述"
git push origin feature/<module-name>
```

### 4.4 每日工作开始

```bash
# 1. 查看当前分支
git branch

# 2. 同步develop分支
git checkout develop
git pull origin develop

# 3. 同步feature分支
git checkout feature/<module-name>
git merge develop

# 4. 开始开发
# ...
```

### 4.5 每日工作结束

```bash
# 1. 查看状态
git status

# 2. 提交未提交的更改
git add .
git commit -m "feat(module): 今日工作内容"

# 3. 推送到远程
git push origin feature/<module-name>

# 4. 查看提交历史
git log --oneline -5
```

---

## 五、冲突解决

### 5.1 合并冲突

```bash
# 1. 尝试合并
git merge develop

# 2. 查看冲突
git status

# 3. 编辑冲突文件
# 手动解决冲突，选择保留的内容

# 4. 标记冲突已解决
git add <conflicted-file>

# 5. 完成合并
git commit

# 6. 测试
pnpm run test
pnpm run typecheck

# 7. 推送
git push origin feature/<module-name>
```

### 5.2 变基冲突

```bash
# 1. 尝试变基
git rebase develop

# 2. 查看冲突
git status

# 3. 编辑冲突文件
# 手动解决冲突

# 4. 标记冲突已解决
git add <conflicted-file>

# 5. 继续变基
git rebase --continue

# 6. 测试
pnpm run test

# 7. 强制推送
git push origin feature/<module-name> --force-with-lease
```

### 5.3 使用合并工具

```bash
# 配置合并工具
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# 使用合并工具解决冲突
git mergetool
```

---

## 六、紧急修复流程

### 6.1 创建hotfix分支

```bash
# 1. 从main创建hotfix分支
git checkout main
git pull origin main
git checkout -b hotfix/<issue-id>

# 2. 修复问题
# ... 修复代码 ...

# 3. 提交
git add .
git commit -m "fix: 修复紧急问题 #<issue-id>"

# 4. 测试
pnpm run test

# 5. 合并到main
git checkout main
git merge hotfix/<issue-id> --no-ff
git tag -a v<version> -m "Hotfix version <version>"
git push origin main --tags

# 6. 合并到develop
git checkout develop
git merge hotfix/<issue-id> --no-ff
git push origin develop

# 7. 删除hotfix分支
git branch -d hotfix/<issue-id>
git push origin --delete hotfix/<issue-id>
```

---

## 七、发布流程

### 7.1 创建release分支

```bash
# 1. 从develop创建release分支
git checkout develop
git pull origin develop
git checkout -b release/v<version>

# 2. 准备发布
# 更新版本号
# 更新CHANGELOG
# 最后测试

# 3. 提交
git add .
git commit -m "chore: 准备发布 v<version>"

# 4. 合并到main
git checkout main
git merge --no-ff release/v<version>
git tag -a v<version> -m "Release version <version>"
git push origin main --tags

# 5. 合并到develop
git checkout develop
git merge --no-ff release/v<version>
git push origin develop

# 6. 删除release分支
git branch -d release/v<version>
git push origin --delete release/v<version>
```

---

## 八、版本标签管理

### 8.1 创建标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐）
git tag -a v1.0.0 -m "Release version 1.0.0

- User模块
- clan模块
- contest模块
- 其他模块"

# 推送指定标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

### 8.2 查看标签

```bash
# 列出所有标签
git tag

# 查看标签详情
git show v1.0.0

# 查看标签历史
git log --oneline --decorate
```

### 8.3 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

---

## 九、分支清理

### 9.1 查看已合并的分支

```bash
# 查看本地已合并的分支
git branch --merged

# 查看远程已合并的分支
git branch -r --merged origin/develop
```

### 9.2 删除已合并的分支

```bash
# 删除本地已合并的分支
git branch -d feature/user
git branch -d feature/clan

# 批量删除已合并的feature分支
git branch --merged | grep feature/ | xargs git branch -d
```

### 9.3 清理远程分支

```bash
# 清理远程已删除的分支
git remote prune origin

# 查看远程分支
git branch -r

# 删除远程分支
git push origin --delete feature/<module-name>
```

---

## 十、故障排查

### 10.1 撤销操作

```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1

# 撤销多次提交
git reset --hard HEAD~3

# 查看reflog（找回丢失的提交）
git reflog

# 恢复丢失的提交
git reset --hard <commit-hash>
```

### 10.2 恢复丢失的分支

```bash
# 1. 查看reflog
git reflog

# 2. 找到分支的commit hash
# 例如：a1b2c3d feature/room

# 3. 恢复分支
git branch feature/room a1b2c3d
```

### 10.3 解决推送失败

```bash
# 情况1：远程有新提交
git pull origin develop
git push origin feature/<module-name>

# 情况2：使用rebase
git fetch origin
git rebase origin/develop
git push origin feature/<module-name> --force-with-lease
```

---

## 十一、提交信息规范

### 11.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 11.2 Type类型

| Type | 说明 | 示例 |
|-------|------|------|
| `feat` | 新功能 | `feat(user): 添加用户登录功能` |
| `fix` | Bug修复 | `fix(room): 修复房间创建失败问题` |
| `docs` | 文档更新 | `docs(api): 更新API文档` |
| `style` | 代码格式调整 | `style: 统一代码格式` |
| `refactor` | 代码重构 | `refactor(user): 重构用户服务` |
| `perf` | 性能优化 | `perf(cache): 优化缓存策略` |
| `test` | 测试相关 | `test(user): 添加用户测试` |
| `build` | 构建配置更新 | `build: 更新webpack配置` |
| `chore` | 其他杂项 | `chore: 更新依赖包` |

### 11.3 提交信息示例

```bash
# 新功能
git commit -m "feat(user): 添加用户登录功能

- 实现JWT认证
- 添加密码加密
- 增加登录日志

Closes #123"

# Bug修复
git commit -m "fix(room): 修复房间创建失败问题

- 检查房间名称合法性
- 添加错误处理
- 优化创建流程

Fixes #456"

# 文档更新
git commit -m "docs(readme): 更新安装说明

- 添加依赖安装步骤
- 更新配置说明
- 添加常见问题解答"
```

---

## 十二、常用别名配置

### 12.1 配置别名

```bash
# 简化常用命令
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### 12.2 使用别名

```bash
# 使用别名简化命令
git co develop              # git checkout develop
git br                     # git branch
git ci -m "message"        # git commit -m "message"
git st                     # git status
git unstage file.txt        # git reset HEAD -- file.txt
git last                   # git log -1 HEAD
```

---

## 十三、图形化工具使用

### 13.1 SourceTree

```bash
# 下载安装SourceTree
# https://www.sourcetreeapp.com/

# 配置Git路径
# Tools > Options > Git > Git Executable Path

# 克隆仓库
# File > Clone > 输入仓库URL

# 创建分支
# 右键点击develop > New Branch

# 合并分支
# 右键点击feature分支 > Merge into develop
```

### 13.2 GitKraken

```bash
# 下载安装GitKraken
# https://www.gitkraken.com/

# 克隆仓库
# File > Clone Repo

# 创建分支
# 右键点击develop > Create Branch

# 合并分支
# 右键点击feature分支 > Merge into develop
```

---

## 十四、项目特定脚本

### 14.1 快速创建feature分支脚本

创建 `scripts/create-feature.sh`：

```bash
#!/bin/bash

# 创建feature分支脚本
MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: ./create-feature.sh <module-name>"
    exit 1
fi

git checkout develop
git pull origin develop
git checkout -b feature/$MODULE_NAME
git push -u origin feature/$MODULE_NAME

echo "Feature branch 'feature/$MODULE_NAME' created successfully!"
```

使用方法：

```bash
chmod +x scripts/create-feature.sh
./scripts/create-feature.sh user
```

### 14.2 快速合并feature分支脚本

创建 `scripts/merge-feature.sh`：

```bash
#!/bin/bash

# 合并feature分支脚本
MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: ./merge-feature.sh <module-name>"
    exit 1
fi

git checkout develop
git pull origin develop
git merge feature/$MODULE_NAME --no-ff -m "feat: 合并$MODULE_NAME模块"
git push origin develop
git branch -d feature/$MODULE_NAME
git push origin --delete feature/$MODULE_NAME

echo "Feature branch 'feature/$MODULE_NAME' merged successfully!"
```

使用方法：

```bash
chmod +x scripts/merge-feature.sh
./scripts/merge-feature.sh user
```

---

## 十五、快速参考卡片

### 15.1 开始新功能

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<module-name>
git push -u origin feature/<module-name>
```

### 15.2 提交代码

```bash
git add .
git commit -m "feat(module): 描述"
git push origin feature/<module-name>
```

### 15.3 合并到develop

```bash
git checkout develop
git pull origin develop
git merge feature/<module-name> --no-ff
git push origin develop
git branch -d feature/<module-name>
git push origin --delete feature/<module-name>
```

### 15.4 同步develop

```bash
git checkout develop
git pull origin develop
git checkout feature/<module-name>
git merge develop
git push origin feature/<module-name>
```

---

## 附录

### A. Git配置文件

```bash
# 全局配置
~/.gitconfig

# 项目配置
.git/config
```

### B. 常用配置

```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置默认分支名
git config --global init.defaultBranch main

# 配置编辑器
git config --global core.editor "code --wait"

# 配置合并工具
git config --global merge.tool vscode
```

### C. 相关资源

- [Git官方文档](https://git-scm.com/doc)
- [GitHub文档](https://docs.github.com/)
- [项目分支策略](./git-branch-strategy.md)
- [实施指导](./git-implementation-guide.md)

---

**文档版本**: v1.0.0
**最后更新**: 2026-01-08
**维护者**: 开发团队
