---
name: git-commit-push
description: >-
  将本地改动提交并推送到远端仓库。分析 diff 生成 commit message，执行 add/commit/push。
  在用户要求提交代码、commit、push、推送远端、保存到 git 时使用。
disable-model-invocation: true
---

# Git Commit & Push

将当前项目的本地改动 **commit 并 push 到远端**（推送为默认步骤）。用户调用本 skill 或要求提交代码时执行；仅当用户**明确说只 commit、不 push** 时才跳过推送。

## 安全规则（必须遵守）

- **禁止**修改 git config
- **禁止**破坏性命令（`push --force`、`reset --hard` 等），除非用户明确要求
- **禁止**跳过 hooks（`--no-verify`、`--no-gpg-sign`），除非用户明确要求
- **禁止**对 `main` / `master` 执行 force push；若用户要求，先警告
- **禁止**提交可能含密钥的文件（`.env`、credentials 等）；发现则警告并排除
- **禁止**在无改动时创建空 commit
- **禁止**使用 `-i` 交互式 git 命令

### amend 规则

仅当**全部**满足时才可 `git commit --amend`：

1. 用户明确要求 amend，或 pre-commit hook 自动改文件需纳入
2. HEAD 由本会话创建（`git log -1 --format='%an %ae'` 核对）
3. 该 commit **尚未** push 到远端

hook 失败或 commit 被拒绝：**不要 amend**，修问题后**新建 commit**。

已 push 的 commit：**不要 amend**（除非用户明确要求且接受 force push）。

## 执行流程

### 1. 并行收集状态

同时运行：

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

了解：未跟踪文件、已改文件、当前分支、远端跟踪关系、近期 commit 风格。

### 2. 分析并起草 commit message

- 概括改动性质（feat / fix / refactor / docs 等）与**目的**（why）
- 1–2 句，简洁；风格对齐 `git log` 近期记录
- 不提交无关文件

### 3. 暂存与提交（顺序执行）

```bash
git add <相关文件>
git commit -m "$(cat <<'EOF'
<commit message>

EOF
)"
```

- pre-commit hook 失败：修复后**新 commit**，不要 amend
- hook 自动改文件：按 amend 规则决定是否 amend

### 4. 推送到远端

```bash
# 确认当前分支与 upstream
git status -sb

# 无 upstream 时
git push -u origin HEAD

# 已有 upstream 时
git push
```

- 推送失败（冲突、权限、protected branch）：报告错误，**不要** force push，给出下一步建议
- 用户明确说「只 commit / 不要 push」时：**跳过 push**，其余照常

### 5. 验证

```bash
git status
```

确认 working tree clean（或说明剩余未提交文件）。

## 输出要求

完成后简要汇报：

- 分支名
- commit hash 与 message
- 是否已 push、远端分支名
- 未纳入提交的文件（如有）

## 示例触发语

- 「提交一下」「commit 一下」（默认含 push）
- 「帮我把本地改动 commit 并 push」
- 「只 commit，不要 push」（例外：跳过推送）
