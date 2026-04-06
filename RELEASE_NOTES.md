# Release Notes Style Guide

Each release note follows this template. Replace `{VER}` with version number and `{PREV}` with previous version.

```markdown
# What's New / 新功能

## {emoji} Section Title / 中文标题

• English bullet point / 中文说明

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-{VER}-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-{VER}-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-{VER}-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-{VER}-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [{PREV}...{VER}](https://github.com/kylefu8/copilot-proxy-gui/compare/{PREV}...{VER})
```

Rules:
- Title: `# What's New / 新功能`
- Sections: `## emoji Title / 中文标题`
- Bullets: `• English / 中文` (use bullet dot `•`, not `-` or `*`)
- Common section emojis: 🚀 UX, 🔗 Upstream Sync, 📐 Window Fix, 💬 Conversation, 🔧 Hotfix, ⬇️ Download
- Download table always at bottom
- macOS note always included
- Changelog link always last line
- No `>` arrows in download table Note column, use plain text

---

# v0.3.7

# What's New / 新功能

## 🚀 Auto 1M Context Window for Claude Code / Claude Code 自动 1M 上下文窗口

• Auto-detect models with 1M context and append `[1m]` suffix to Claude Code env vars / 自动检测 1M 上下文模型，在 Claude Code 环境变量中追加 `[1m]` 后缀
• Claude Code recognizes `[1m]` to enable 1M context mode and strips it before API requests / Claude Code 识别 `[1m]` 启用 1M 上下文模式，发送请求前自动剥离后缀
• Only applies to Claude models; GPT, Gemini and other models are not affected / 仅对 Claude 模型生效，GPT、Gemini 等不受影响
• Green hint shown when 1M context is detected / 检测到 1M 上下文时显示绿色提示

## 🔧 Enhanced Model Selector / 增强模型选择器

• Model dropdowns now show context window size, e.g. `claude-opus-4.6-1m (1M)`, `gpt-5.4 (400K)` / 模型下拉框现在显示上下文窗口大小
• Added `ANTHROPIC_DEFAULT_OPUS_MODEL` to env vars, ensuring `/model opus` and `opusplan` route through proxy / 新增 `ANTHROPIC_DEFAULT_OPUS_MODEL` 环境变量，确保 CC 内切换 opus 别名也走代理

## 🔧 Skip-Permissions Mode / 跳过权限模式

• `--dangerously-skip-permissions` option with two-stage safety confirmation (settings toggle + launch-time dialog) / `--dangerously-skip-permissions` 选项，两阶段安全确认（设置页开关 + 启动时二次确认）

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.7-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.7-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.7-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.7-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.6...v0.3.7](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.6...v0.3.7)

---

# v0.3.6

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgrade embedded copilot-proxy from v0.4.1 to v0.4.2 / 内嵌的 copilot-proxy 从 v0.4.1 升级到 v0.4.2
• Fix Claude Code stalls on Anthropic messages / 修复 Claude Code 在 Anthropic messages 接口上卡住的问题

## 🚀 Claude Code Skip Permissions / Claude Code 跳过权限确认

• New setting to launch Claude Code with `--dangerously-skip-permissions` / 新增设置项，启动 Claude Code 时附加 `--dangerously-skip-permissions` 参数
• Two-stage safety confirmation: danger dialog on enable + danger dialog on launch / 两阶段安全确认：开启时弹窗确认 + 启动时二次确认
• Red-themed danger dialogs with full Chinese/English bilingual support / 红色警告风格弹窗，完整中英文双语支持
• Shared `DangerConfirmDialog` component reused across settings and main view / 共享 `DangerConfirmDialog` 组件，设置页和主界面复用
• Danger dialog styles auto-adapt to all 5 built-in themes / 危险弹窗样式自动适配全部 5 套内置主题

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.6-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.6-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.6-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.6-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.5...v0.3.6](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.5...v0.3.6)

---

# v0.3.5

# What's New / 新功能

## � Upstream Upgrade / 上游升级

• Upgrade embedded copilot-proxy from v0.3.1 base to upstream v0.4.1 / 内嵌的 copilot-proxy 从 v0.3.1 基线升级到上游 v0.4.1
• HTTP resilience: upstream timeout defaults and SSE keepalive / HTTP 韧性：上游超时默认值和 SSE keepalive
• Improved Anthropic Messages protocol compatibility / 改进的 Anthropic Messages 协议兼容性
• Fix count_tokens JSONResponseError propagation / 修复 count_tokens 的 JSONResponseError 传播

## 🔧 Bug Fixes / 修复

• Fix Claude Code detection on macOS when nvm is used (npm_config_prefix conflict) / 修复 macOS 下使用 nvm 时 Claude Code 检测失败的问题
• Fix missing default-model conversations in viewer on macOS (stdout line splitting) / 修复 macOS 下默认模型对话记录不显示的问题（stdout 行拆分）

## 💬 Conversation Recording / 对话记录

• Middleware architecture maintained: zero handler changes, zero conflict on upgrade / 中间件架构保持不变：handler 零修改，升级零冲突

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.5-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.5-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.5-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.5-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.3...v0.3.5](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.3...v0.3.5)

---

# v0.3.3

# What's New / 新功能

## 💬 Conversation Recording / 对话记录

• Record full request/response content to local JSON files (streaming auto-assembled) / 完整记录请求与 AI 回复到本地 JSON 文件（流式自动拼接）
• Built-in conversation viewer with session sidebar and message panel / 内置对话浏览器，左栏会话列表 + 右栏消息面板
• Auto-detect client type: Claude Code, Cursor, Continue, Cline, etc. / 自动识别客户端来源
• Session grouping by client + model with 15-min idle timeout / 按客户端+模型分组会话，15 分钟空闲自动断开
• Sessions organized by date (Today / Yesterday / older dates) / 会话按日期归类
• Full-text search with matching text highlight / 全文搜索，匹配文本高亮显示
• Multi-select sessions + batch delete / 多选会话 + 批量删除
• Real-time push: new entries appear instantly in open viewer / 实时推送：新对话即时出现在浏览器中
• Theme and language sync with main window / 配色与语言跟随主窗口实时切换
• Toggle in Settings > Service Config (off by default, requires service restart) / 在设置 > 服务参数中开关控制（默认关闭，需重启服务生效）

## 🔧 Architecture / 架构改进

• Refactored from handler-level hooks to a single Hono middleware / 从分散的 handler hook 重构为统一的 Hono 中间件
• Only 2 lines added to upstream server.ts (import + use), zero handler changes / 上游 server.ts 仅增加 2 行，handler 零修改
• Eliminates merge conflict risk when upstream updates handlers / 消除上游更新 handler 时的合并冲突风险

## 🚀 UX / 体验优化

• Reorder header buttons: Theme → Language → Conversations → Logs → Settings → About / 顶栏按钮重新排序
• Recording toggle moved to Settings page / 记录开关移至设置页面
• Fix settings checkbox alignment / 修复设置页面复选框对齐

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.2...v0.3.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.2...v0.3.3)

---

# v0.3.2

# What's New / 新功能

## 💬 Conversation Recording / 对话记录

• Record full request/response content to local JSON files (streaming auto-assembled) / 完整记录请求与 AI 回复到本地 JSON 文件（流式自动拼接）
• Built-in conversation viewer with session sidebar and message panel / 内置对话浏览器，左栏会话列表 + 右栏消息面板
• Auto-detect client type: Claude Code, Cursor, Continue, Cline, etc. / 自动识别客户端来源
• Session grouping by client + model with 15-min idle timeout / 按客户端+模型分组会话，15 分钟空闲自动断开
• Sessions organized by date (Today / Yesterday / older dates) / 会话按日期归类
• Full-text search with matching text highlight / 全文搜索，匹配文本高亮显示
• Multi-select sessions + batch delete / 多选会话 + 批量删除
• Real-time push: new entries appear instantly in open viewer / 实时推送：新对话即时出现在浏览器中
• Theme and language sync with main window / 配色与语言跟随主窗口实时切换
• Toggle in Settings > Service Config (off by default, requires service restart) / 在设置 > 服务参数中开关控制（默认关闭，需重启服务生效）

## 🚀 UX / 体验优化

• Reorder header buttons: Theme → Language → Conversations → Logs → Settings → About / 顶栏按钮重新排序
• Fix settings checkbox alignment / 修复设置页面复选框对齐

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.2-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.2-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.2-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.2-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.1...v0.3.2](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.1...v0.3.2)

---

# v0.3.1

# What's New / 新功能

## 🔧 Hotfix / 热修复

• Fix macOS window height regression: skip frame compensation on macOS where `useContentSize` already handles it correctly / 修复 macOS 窗口高度回归：在 macOS 上跳过 frame 补偿，`useContentSize` 已正确处理

## 🔗 Upstream Sync / 上游同步

• Upstream PR merged: Anthropic `/v1/messages` compatibility fix is now official (`Jer-y/copilot-proxy#2`) / 上游 PR 已合并：Anthropic `/v1/messages` 兼容性修复已正式进入上游
• Submodule restored to upstream `Jer-y/copilot-proxy` (merge commit `b162b63`, ahead of upstream `v0.3.1`) / 子模块恢复指向上游，当前版本比上游正式发布 `v0.3.1` 更新

## 🚀 UX / 体验优化

• Auto-refresh usage on first panel expand after app launch / 程序启动后首次展开用量面板时自动刷新用量
• About page now shows the app logo instead of a generic emoji / 关于页面现在显示应用 logo 而非通用 emoji

## 📐 Window Height Fix / 窗口高度修复

• Fix excessive bottom whitespace on Windows by compensating for title bar / border frame in `resizeWindow` / 修复 Windows 下窗口底部留白过多的问题
• Platform-specific padding: Windows uses tighter padding while macOS remains unchanged / 平台差异化 padding：Windows 使用更紧凑的间距，macOS 保持不变
• Fix applies to Main view, Settings page, and About page / 修复覆盖主界面、设置页面和关于页面

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.0...v0.3.1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.0...v0.3.1)

---

# v0.3.0

# What's New / 新功能

## 🔗 Upstream Sync / 上游同步

• Upstream PR merged: Anthropic `/v1/messages` compatibility fix is now official (`Jer-y/copilot-proxy#2`) / 上游 PR 已合并：Anthropic `/v1/messages` 兼容性修复已正式进入上游
• Submodule restored to upstream `Jer-y/copilot-proxy` (merge commit `b162b63`, ahead of upstream `v0.3.1`) / 子模块恢复指向上游

## 🚀 UX / 体验优化

• Auto-refresh usage on first panel expand after app launch / 程序启动后首次展开用量面板时自动刷新用量
• About page now shows the app logo instead of a generic emoji / 关于页面现在显示应用 logo 而非通用 emoji

## 📐 Window Height Fix / 窗口高度修复

• Fix excessive bottom whitespace on Windows by compensating for title bar / border frame in `resizeWindow` / 修复 Windows 下窗口底部留白过多的问题
• Platform-specific padding: Windows uses tighter padding while macOS remains unchanged / 平台差异化 padding
• Fix applies to Main view, Settings page, and About page / 修复覆盖主界面、设置页面和关于页面

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.2.9...v0.3.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.2.9...v0.3.0)

---

# v0.2.9

# What's New / 新功能

## 🚀 Proxy Upgrade / Proxy 升级

• Upgrade embedded `copilot-proxy` to upstream `v0.3.0` / 内嵌的 `copilot-proxy` 升级到上游 `v0.3.0`
• Restore compatibility for Anthropic `/v1/messages` requests without `max_tokens` / 恢复对未携带 `max_tokens` 的 Anthropic `/v1/messages` 请求兼容性

## 🚀 UX / 体验优化

• Main screen adds a dedicated model refresh button / 主界面新增独立的模型刷新按钮
• Claude Code model changes auto-sync `~/.claude/settings.json` / 切换模型后自动同步 Claude Code 配置
• Usage refresh button uses clearer icon and text / 用量刷新按钮改为更清晰的图标和文字
• Settings button icon updated / 设置按钮图标更新

## 📋 Verbose Logs / 详细日志

• Model refresh actions now appear in Verbose logs / 刷新模型列表的动作现在会显示在 Verbose 日志中

## 🔧 Bug Fixes / 问题修复

• Fix lightweight update ENOENT error: use `original-fs` for `.asar` file operations / 修复轻量更新 ENOENT 报错

## 🛠 Developer Experience / 开发体验

• Dev mode (`COPILOT_GUI_DEV=1`) now skips single-instance lock / 开发模式下跳过单实例检测

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.2.9-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.2.9-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.2.9-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.2.9-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.2.8...v0.2.9](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.2.8...v0.2.9)
