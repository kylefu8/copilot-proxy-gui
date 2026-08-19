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

# v0.10.0-2

# What's New / 新功能

## 👤 Single-Account Transition / 单账号切换

• Replaced the impossible “delete the only account” action with an explicit “Exit Multi-account” flow / 将必然失败的“删除唯一账号”操作改为明确的“退出多账号模式”流程
• The final account token is first written to Electron encrypted storage, `accounts.json` is renamed to a timestamped backup, and account token files are preserved for recovery / 最后一个账号的 Token 会先写入 Electron 加密存储，`accounts.json` 改名为带时间戳的备份，并保留账号 Token 文件以便恢复
• Added runtime/account-lock and configuration-snapshot checks so concurrent changes fail safely without removing the active configuration / 新增 runtime/account lock 与配置快照检查，并发变化时安全失败，不移除当前配置
• Returning to multi-account mode remains available through “Migrate Current Login” or a fresh Device Flow login / 之后仍可通过“迁移当前登录”或重新执行 Device Flow 再次启用多账号模式
• After exiting multi-account mode, model refresh now omits the empty account ID and reliably returns to the encrypted single-account flow instead of reporting an explicit-account error / 退出多账号模式后，模型刷新会省略空账号 ID，并可靠回到加密单账号流程，不再误报显式账号模式错误

## 🧭 Clear Account Feedback / 清晰的账号反馈

• Account CLI failures now remove ANSI terminal controls and diagnostic noise, then show actionable bilingual messages for duplicate identities, referenced accounts, invalid logins, and runtime locks / 账号 CLI 错误现在会移除 ANSI 控制码与诊断噪音，并针对重复身份、账号引用、登录失效及运行锁显示可操作的双语提示
• Invalid GitHub credentials are shown as a direct re-authentication prompt instead of a raw `Failed to get GitHub user` model-command error / GitHub 凭据失效时直接提示重新登录，不再显示原始 `Failed to get GitHub user` 模型命令错误
• A successfully loaded empty catalog now shows “No models available” with subscription/account-type guidance instead of remaining on “Loading model list” / 模型目录成功加载但为空时，显示“无可用模型”及订阅/账号类型提示，不再停留在“正在加载模型列表”

## 🔗 Device Verification / 设备验证

• Clicking the GitHub Device Flow verification link now always opens the system default browser and never navigates inside the verification-code popup / 点击 GitHub Device Flow 验证链接时始终使用系统默认浏览器，不再在验证码弹窗内导航
• External navigation is restricted to the official `https://github.com/login/device` URL / 外部导航仅允许官方 `https://github.com/login/device` 地址

## 🔧 Compatibility / 兼容性

• Keeps the embedded `copilot-proxy` and conversation-recording fork unchanged from `v0.10.0` / 内嵌 `copilot-proxy` 与对话记录 fork 保持 `v0.10.0` 不变
• Existing multi-account data, routes, themes, Claude Code integration, lightweight updates, and single-account authentication remain compatible / 现有多账号数据、路由、主题、Claude Code 集成、轻量更新及单账号认证保持兼容
• This cumulative release supersedes `v0.10.0-1` and includes every GUI fix since `v0.10.0` / 本累计版本取代 `v0.10.0-1`，包含自 `v0.10.0` 以来的全部 GUI 修复

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.10.0-2-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.10.0-2-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.10.0-2-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.10.0-2-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.10.0...v0.10.0-2](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.10.0...v0.10.0-2)

# v0.10.0

# What's New / 新功能

## 👥 Multi-Account Management / 多账号管理

• Added a complete GUI for up to eight GitHub Copilot accounts: add, migrate the current login, re-authenticate, set the default, and remove accounts / 新增最多八个 GitHub Copilot 账号的完整 GUI：添加、迁移当前登录、重新认证、设置默认账号及删除账号
• Added ordered model-glob routing and account-scoped model catalog and usage views / 新增有序模型 glob 路由，以及按账号查看模型目录和用量
• Models selected from a non-default account use the deterministic `<account>/<model>` selector while request headers and configured routes keep their upstream precedence / 从非默认账号选择的模型使用确定性的 `<account>/<model>` selector，同时保留请求头与已配置路由的上游优先级

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.9.3` to `v0.10.0`, including deterministic multi-account routing, account-scoped token recovery, model catalogs, readiness, diagnostics, and concurrency / 内嵌 copilot-proxy 从上游 `v0.9.3` 升级到 `v0.10.0`，包含确定性多账号路由、账号级 Token 恢复、模型目录、就绪检查、诊断与并发控制
• Enabled Codex hosted tools in the proxy catalog and improved graceful shutdown and Windows owner-only state protection / 在代理目录中启用 Codex hosted tools，并改进优雅关闭与 Windows 仅所有者状态保护
• Upstream removed legacy `start -d`; the GUI is unaffected because it has always managed a foreground child process / 上游移除了旧版 `start -d`；GUI 一直自行管理前台子进程，因此不受影响

## 🔐 Authentication & Compatibility / 认证与兼容性

• Existing single-account users remain on the encrypted one-shot `GH_TOKEN` flow until they explicitly enable multi-account mode / 现有单账号用户继续使用加密的一次性 `GH_TOKEN` 流程，只有主动启用多账号时才迁移
• Explicit multi-account mode treats upstream `accounts.json` and owner-only `tokens/<account-id>` files as authoritative and never injects the legacy GUI token / 显式多账号模式以上游 `accounts.json` 与仅所有者可访问的 `tokens/<account-id>` 为准，不再注入旧 GUI Token
• Account and route changes are disabled while the GUI proxy is running, matching upstream runtime-lock requirements / GUI 代理运行时禁用账号和路由写操作，与上游 runtime lock 要求保持一致
• Routing is deterministic and does not provide automatic failover, load balancing, or quota pooling / 路由是确定性的，不提供自动故障转移、负载均衡或配额池化

## 💬 Preserved GUI Features / 保留的 GUI 功能

• Rebased the conversation recording middleware onto `conv-middleware-v0100` while keeping the proxy fork limited to `src/lib/conversation-middleware.ts` and `src/server.ts` / 将对话记录中间件重放到 `conv-middleware-v0100`，代理 fork 仍仅涉及 `src/lib/conversation-middleware.ts` 与 `src/server.ts`
• Preserved loopback Host allowlisting, Claude Code launch/config integration, themes, tray controls, lightweight updates, and Electron `41.10.1` / Node `24.18.0` / 保留本地 Host 白名单、Claude Code 启动与配置、主题、托盘控制、轻量更新，以及 Electron `41.10.1` / Node `24.18.0`

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.10.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.10.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.10.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.10.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.9.3...v0.10.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.9.3...v0.10.0)

# v0.9.3

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.9.0` to `v0.9.3` without publishing intermediate GUI versions / 内嵌 copilot-proxy 从上游 `v0.9.0` 升级到 `v0.9.3`，不发布中间 GUI 版本
• Rebased the local conversation recording middleware onto `conv-middleware-v093` while keeping the fork limited to two proxy files / 将本地对话记录中间件重放到 `conv-middleware-v093`，代理 fork 仍仅涉及两个文件

## 🧭 Setup & Diagnostics / 配置与诊断

• Added upstream guided setup, live model inspection, doctor diagnostics, generated Codex/Claude/OpenAI-compatible profiles, and runtime presets / 新增上游引导式配置、实时模型检查、doctor 诊断、Codex/Claude/OpenAI 兼容配置生成及运行预设
• Added the read-only diagnostics API/dashboard data surface and stronger native, legacy, Windows, UNC, shell, and container service handling / 新增只读诊断 API/面板数据，并加强原生服务、旧版服务、Windows、UNC、shell 与容器启动处理
• These upstream CLI and diagnostics capabilities are included in the embedded proxy; this release does not add new GUI pages for them / 内嵌代理已包含这些上游 CLI 与诊断能力，本次不额外新增对应 GUI 页面

## 🧠 Claude & Streaming / Claude 与流式处理

• Added Claude Opus 5 support with verified reasoning, tools, 64K output, and Claude Code 1M selector compatibility / 新增 Claude Opus 5，支持已验证的推理、工具、64K 输出及 Claude Code 1M selector
• Improved model normalization and strict protocol handling for tool changes, fallback boundaries, system blocks, and Responses translation / 改进模型规范化，并严格处理工具变化、fallback 边界、system block 与 Responses 转换
• Keeps idle Anthropic SSE connections alive with periodic ping events during long upstream gaps / 在上游长时间无事件时发送周期性 ping，避免 Anthropic SSE 空闲连接断开

## 🔧 GUI Compatibility / GUI 兼容性

• Preserved encrypted Token startup through one-shot `GH_TOKEN`, loopback Host allowlisting, conversation recording, and Electron `41.10.1` / Node `24.18.0` / 保留一次性 `GH_TOKEN` 加密 Token 启动、本地 Host 白名单、对话记录，以及 Electron `41.10.1` / Node `24.18.0`

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.9.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.9.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.9.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.9.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.9.0...v0.9.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.9.0...v0.9.3)

# v0.9.0

# What's New / 新功能

## 🚀 Upgrade Overview / 从 v0.7.15-3 升级

• This consolidated release note covers the complete supported upgrade path from GUI `v0.7.15-3` to `v0.9.0` / 本说明汇总 GUI 从 `v0.7.15-3` 到 `v0.9.0` 的完整升级路径
• Upgraded the embedded proxy from the `v0.7.15`-based fork in GUI `v0.7.15-3` to upstream `v0.9.0` while preserving local conversation recording / 内嵌代理从 GUI `v0.7.15-3` 使用的上游 `v0.7.15` 分支升级到 `v0.9.0`，并保留本地对话记录
• Intermediate `v0.8.x` GitHub Releases were retired; their tags and detailed repository history remain available / 中间的 `v0.8.x` GitHub Releases 已下线，其 tags 和仓库详细历史仍保留

## 🔌 Models & Protocols / 模型与协议

• Moved the GPT-5.6 family support previously carried from upstream PR #12 onto the official upstream baseline while preserving responses-only routing and `max` reasoning / 将此前由上游 PR #12 提前提供的 GPT-5.6 系列支持切换到正式上游基线，并保留 responses-only 路由和 `max` 推理强度
• Added native OpenAI Responses WebSocket support with stable response/item IDs, FIFO turn handling, cancellation, and bounded buffering / 新增原生 OpenAI Responses WebSocket，支持稳定的 response/item ID、FIFO 请求处理、取消和受限缓冲
• Tightened Claude/Responses translation so unsupported tools, structured output, instructions, or persistence semantics return explicit client-compatible errors instead of being silently dropped / 收紧 Claude/Responses 转换，无法保真的工具、结构化输出、指令或持久化语义会明确返回兼容错误，不再静默丢弃

## 🛡️ Reliability & Security / 稳定性与安全性

• Hardened Host/CORS validation, token exposure, request translation fidelity, and native-service lifecycle handling across Windows, macOS, and Linux / 加强 Host/CORS 校验、Token 暴露、请求转换保真度，以及 Windows、macOS、Linux 原生服务生命周期处理
• Added bounded Copilot authentication recovery, optional FIFO concurrency limits, and passive `/livez` and `/readyz` health endpoints / 新增受限的 Copilot 认证恢复、可选 FIFO 并发限制，以及被动 `/livez`、`/readyz` 健康检查端点
• Upgraded the packaged runtime from Electron 33 / Node 20 to Electron `41.10.1` / Node `24.18.0` to satisfy the current proxy runtime contract / 打包运行时从 Electron 33 / Node 20 升级到 Electron `41.10.1` / Node `24.18.0`，满足当前代理运行要求

## 🖥️ GUI Improvements / GUI 改进

• Rebased the conversation recording middleware onto the `v0.9.0` proxy and introduced the new bidirectional gateway application/tray icon / 将对话记录中间件重放到 `v0.9.0` 代理基线，并引入全新的双向网关应用/托盘图标
• Fixed GUI startup for copilot-proxy `0.8+`: the encrypted GUI token now uses the one-shot `GH_TOKEN` environment input and is removed from long-running command-line arguments / 修复 copilot-proxy `0.8+` 的 GUI 启动：加密保存的 Token 改用一次性 `GH_TOKEN` 环境输入，不再出现在长期进程参数中
• Explicitly allows the GUI's `localhost`, `127.0.0.1`, and `::1` callers while preserving user-provided `COPILOT_PROXY_ALLOWED_HOSTS` entries / 显式允许 GUI 使用的 `localhost`、`127.0.0.1` 和 `::1`，同时保留用户提供的 `COPILOT_PROXY_ALLOWED_HOSTS`

## ⚠️ Upgrade Notes / 升级注意事项

• `-g/--github-token` is now initialization-only: it saves the token and exits; long-running external launchers must restart without `-g` / `-g/--github-token` 现在仅用于初始化：保存 Token 后退出；外部长期运行脚本必须移除 `-g` 后再次启动
• Non-loopback callers must set `COPILOT_PROXY_ALLOWED_HOSTS` to the actual Host used by Docker, reverse proxies, systemd, or Kubernetes / 非回环调用方必须按 Docker、反向代理、systemd 或 Kubernetes 实际使用的 Host 设置 `COPILOT_PROXY_ALLOWED_HOSTS`
• `GET /token` is disabled by default, and Responses-to-Anthropic translation requires explicit `store: false` / `GET /token` 默认关闭，Responses 到 Anthropic 的转换需要显式设置 `store: false`

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.9.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.9.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.9.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.9.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.15-3...v0.9.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-3...v0.9.0)

# v0.8.0-1

# What's New / 新功能

## 🎨 New App Icon / 全新应用图标

• Replaced the previous goggles-and-arrow icon with a clearer bidirectional proxy gateway / 用更清晰的双向代理网关图形替换原有护目镜加箭头图标
• Opposing cyan and violet data routes now show request and response traffic crossing the local proxy boundary / 青色与紫色的相反数据流表示请求和响应穿过本地代理边界
• Updated the Windows executable icon, application/window icon, system tray variants, macOS template icon, and renderer icon from the same design / 同步更新 Windows 程序图标、应用窗口图标、系统托盘图标、macOS 模板图标和页面图标
• Multi-resolution Windows icons remain legible from 16px through 256px / Windows 多尺寸图标在 16px 到 256px 下均保持清晰可辨

## 🔧 Compatibility / 兼容性

• Keeps the embedded proxy on upstream `v0.8.0` with Electron `41.10.1`; this hotfix does not change proxy behavior / 内嵌代理仍为上游 `v0.8.0`，Electron 仍为 `41.10.1`；本次 hotfix 不改变代理行为

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.8.0-1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.8.0-1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.8.0-1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.8.0-1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.8.0...v0.8.0-1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.8.0...v0.8.0-1)

# v0.8.0

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.7.15` to `v0.8.0` / 内嵌 copilot-proxy 从上游 `v0.7.15` 升级到 `v0.8.0`
• Included official GPT-5.6 family support from upstream `v0.7.16` / 纳入上游 `v0.7.16` 正式发布的 GPT-5.6 系列支持
• Added stricter host, CORS, token exposure, request translation, and native-service lifecycle protections / 加强 Host、CORS、token 暴露、请求转换和原生服务生命周期保护
• Requests that cannot be translated faithfully now return a clear `400` instead of silently dropping fields / 无法可靠转换的请求现在会明确返回 `400`，不再静默丢弃字段

## 🔧 Runtime Compatibility / 运行时兼容性

• Upgraded Electron from `33.4.11` to `41.10.1`, moving the packaged runtime from Node `20.18.3` to Node `24.18.0` / Electron 从 `33.4.11` 升级到 `41.10.1`，打包运行时由 Node `20.18.3` 升级到 Node `24.18.0`
• Preserved local conversation recording middleware on the new `conv-middleware-v080` branch / 在新的 `conv-middleware-v080` 分支上保留本地对话记录中间件
• Non-loopback deployments must explicitly configure `COPILOT_PROXY_ALLOWED_HOSTS` and `COPILOT_PROXY_CORS_ORIGINS`; the GUI's default localhost mode continues to work without extra configuration / 非回环地址部署需显式配置 `COPILOT_PROXY_ALLOWED_HOSTS` 和 `COPILOT_PROXY_CORS_ORIGINS`；GUI 默认 localhost 模式无需额外配置

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.8.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.8.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.8.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.8.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.15-3...v0.8.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-3...v0.8.0)

# v0.7.15-3

# What's New / 新功能

## Model Update / 模型更新

• Added GPT-5.6 family routing from upstream PR #12 before the upstream release tag is available / 在上游正式 tag 前先合入 PR #12 的 GPT-5.6 系列路由配置
• Configured `gpt-5.6`, `gpt-5.6-sol`, `gpt-5.6-luna`, and `gpt-5.6-terra` as responses-only models / 将 `gpt-5.6`、`gpt-5.6-sol`、`gpt-5.6-luna`、`gpt-5.6-terra` 配置为仅走 Responses API
• Enabled GPT-5.6 thinking mode with reasoning efforts up to `max` / 启用 GPT-5.6 thinking 模式，并支持最高 `max` 推理强度

## Compatibility / 兼容性

• Kept the GUI release on the upstream-aligned `0.7.15-N` track / 继续保持 GUI 在与上游对齐的 `0.7.15-N` 小版本轨道
• Preserved local conversation recording middleware on top of the `0.7.15` upstream base / 在 `0.7.15` 上游基线上保留本地对话记录中间件

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.15-3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.15-3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.15-3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.15-3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.15-2...v0.7.15-3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-2...v0.7.15-3)

# v0.7.15-2

# What's New / 新功能

## Hotfix / 修复

• Published a follow-up hotfix on the `0.7.15-N` track so clients already on `0.7.15-1` can receive numeric suffix updates through the in-app updater / 在 `0.7.15-N` 轨道发布后续小更新，已升级到 `0.7.15-1` 的客户端可通过软件内更新接收数字后缀版本
• Kept the embedded upstream copilot-proxy version aligned with `0.7.15`; this release does not change upstream proxy behavior / 内嵌上游 copilot-proxy 仍与 `0.7.15` 对齐，本次不改变上游代理行为
• Preserved the Claude Code Windows path detection and `-N` update comparison fixes from `0.7.15-1` / 保留 `0.7.15-1` 中的 Claude Code Windows 路径检测和 `-N` 更新比较修复

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.15-2-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.15-2-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.15-2-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.15-2-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.15-1...v0.7.15-2](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-1...v0.7.15-2)

# v0.7.15-1

# What's New / 新功能

## Hotfix / 修复

• Added Windows Claude Code detection for `%USERPROFILE%\.claude-cli\claude.exe` / Windows 下新增对 `%USERPROFILE%\.claude-cli\claude.exe` 的 Claude Code 检测
• Claude Code launch now reuses the resolved fallback executable path when PATH cannot resolve `claude` / 当 PATH 无法解析 `claude` 时，启动 Claude Code 会复用检测到的 fallback 可执行文件路径
• Update checks now treat numeric `-N` release suffixes as newer hotfix revisions / 更新检查现在会把数字 `-N` 后缀识别为更新的 hotfix 修订版

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.15-1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.15-1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.15-1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.15-1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.15...v0.7.15-1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15...v0.7.15-1)

# v0.7.15

# What's New / 新功能

## Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.11 to v0.7.15 / 内嵌 copilot-proxy 从 v0.7.11 升级到 v0.7.15
• Removed hidden Claude variant routing and now preserves upstream context/fast beta signals while normalizing historical Claude model IDs / 移除隐藏 Claude 变体路由，改为规范化历史模型名并保留上游 context/fast beta 信号
• Expanded Claude upstream capability coverage, including safer handling for native server-side tools and Anthropic-to-Responses translation boundaries / 扩展 Claude 上游能力覆盖，包括原生服务端工具和 Anthropic 到 Responses 转换边界的处理

## Reliability / 稳定性

• Hardened streaming cancellation and recovery so aborted clients do not leave upstream streams running unnecessarily / 加强流式取消与恢复逻辑，客户端断开时不再无谓保留上游流
• Tightened token handling by rejecting token exposure in daemon/supervisor logging paths / 收紧 token 处理，避免 daemon/supervisor 日志路径暴露 token
• Switched autostart toward native service managers on Windows/macOS/Linux while retaining legacy daemon compatibility / 自动启动改向 Windows/macOS/Linux 原生服务管理器，同时保留旧 daemon 兼容

## Compatibility / 兼容性

• Rebased local conversation recording patches onto `conv-middleware-v0715` with no conflicts / 本地对话记录补丁已无冲突重放到 `conv-middleware-v0715`
• Kept the Electron JavaScript bundle packaging path unchanged / Electron JavaScript bundle 打包路径保持不变

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.15-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.15-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.15-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.15-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.11...v0.7.15](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.11...v0.7.15)

# v0.7.11

# What's New / 新功能

## Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.9 to v0.7.11 / 内嵌 copilot-proxy 从 v0.7.9 升级到 v0.7.11
• Added upstream support for Anthropic system messages / 同步上游对 Anthropic system messages 的支持
• Preserved the GUI conversation recording middleware on the new upstream base / 在新的上游基线上保留 GUI 对话记录中间件

## Compatibility / 兼容性

• Rebased local conversation recording patches onto `conv-middleware-v0711` with no conflicts / 本地对话记录补丁已无冲突重放到 `conv-middleware-v0711`
• Kept the Electron JavaScript bundle packaging path unchanged / Electron JavaScript bundle 打包路径保持不变

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.11-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.11-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.11-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.11-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.9.1...v0.7.11](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.9.1...v0.7.11)

# v0.7.9.1

# What's New / 新功能

## Claude Code / Claude Code

• Added a service-parameter toggle for auto-appending `[1m]` when launching Claude Code or writing config / 服务参数新增自动追加 `[1m]` 后缀开关，用于启动 Claude Code 或写入配置
• The toggle is off by default; when disabled, model names are left unchanged / 该开关默认关闭；未勾选时不再自动修改模型名
• When enabled, `[1m]` is still appended only for selected Claude models with context window at least 1M / 勾选后仍只会对上下文窗口不小于 1M 的 Claude 模型追加 `[1m]`

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.9.1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.9.1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.9.1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.9.1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.9...v0.7.9.1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.9...v0.7.9.1)

# v0.7.9

# What's New / 新功能

## Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.8 to v0.7.9 / 内嵌 copilot-proxy 从 v0.7.8 升级到 v0.7.9
• Added Codex model catalog compatibility in the proxy models route / 代理模型列表新增 Codex 模型目录兼容
• Preserved the GUI conversation recording middleware on the new upstream base / 在新的上游基线上保留 GUI 对话记录中间件

## Compatibility / 兼容性

• Rebased local conversation recording patches onto `conv-middleware-v079` with no conflicts / 本地对话记录补丁已无冲突重放到 `conv-middleware-v079`
• Kept the Electron JavaScript bundle packaging path unchanged / Electron JavaScript bundle 打包路径保持不变

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.9-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.9-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.9-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.9-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.8...v0.7.9](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.8...v0.7.9)

---

# v0.7.8

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.7 to v0.7.8 / 内嵌 copilot-proxy 从 v0.7.7 升级到 v0.7.8
• Added JSON request body size limit (32 MB default, configurable via `COPILOT_PROXY_MAX_JSON_BODY_BYTES`) / 新增 JSON 请求体大小限制（默认 32 MB，可通过环境变量配置）
• Added upstream fetch timeouts (15 min for Copilot, 30 s for GitHub API) with proper 504 error responses / 新增上游请求超时（Copilot 15 分钟，GitHub API 30 秒），返回标准 504 错误
• Improved daemon lifecycle on Windows: file-based stop signal instead of SIGTERM, Win32 process detection fallback / 改进 Windows 守护进程管理：使用文件信号代替 SIGTERM 停止进程
• Daemon log rotation (10 MB max, 3 rotated files) / 守护进程日志轮转（最大 10 MB，保留 3 个历史文件）
• Supervisor crash limit: exits after 10 consecutive failures / 守护进程连续崩溃 10 次后自动退出
• Disabled Bun server idle timeout to prevent premature connection drops / 禁用 Bun 服务器空闲超时，防止连接提前断开
• Security hardening: auth secret redaction, usage dashboard XSS escaping, shell command quoting, document URL fetch validation / 安全加固：认证密钥脱敏、仪表盘 XSS 转义、Shell 命令引号处理、文档 URL 获取校验
• Improved Anthropic ↔ Responses API translation fidelity / 改进 Anthropic ↔ Responses API 翻译保真度
• Unified request policy (rate limit + manual approval) across all upstream routes / 统一所有上游路由的请求策略

## 🔧 Bug Fixes / 问题修复

• Fixed `undici@8.x` crash on Electron's Node 20 (`markAsUncloneable` not a function) — undici is now excluded from the bundle and uses Node's built-in version / 修复 undici@8.x 在 Electron Node 20 下崩溃的问题，改用 Node 内置版本
• Fixed conversation middleware body stream conflict with upstream's new `readJsonBodyText` — request body is now cloned before reading / 修复对话记录中间件与上游新 body 读取方式的冲突

## 🚀 Version Rollback / 版本回滚

• Hold Shift and click "Check for Updates" to rollback to any previous version that supports lightweight update / 按住 Shift 点击"检查更新"可回滚到任意支持轻量更新的历史版本
• Only available in installed mode (not portable) / 仅安装版可用，便携版不支持

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.8-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.8-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.8-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.8-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.7...v0.7.8](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.7...v0.7.8)

---

# v0.7.7

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.5 to v0.7.7 / 内嵌 copilot-proxy 从 v0.7.5 升级到 v0.7.7
• Gracefully degrade unsupported Anthropic advisor tool (`advisor_20260301`) — stripped from Copilot backend requests / 优雅降级不支持的 Anthropic advisor tool，从发往 Copilot 后端的请求中自动剥离
• Stricter model config prefix matching to prevent false positives / 更严格的模型配置前缀匹配，防止误匹配
• Fixed request abort signal handling in responses proxy / 修复 responses 代理中的请求中止信号处理

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.7-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.7-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.7-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.7-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.5...v0.7.7](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.5...v0.7.7)

---

# v0.7.5

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.3 to v0.7.5 / 内嵌 copilot-proxy 从 v0.7.3 升级到 v0.7.5
• Default bind address changed from `0.0.0.0` to `127.0.0.1` for improved security (loopback only) / 默认监听地址从 `0.0.0.0` 改为 `127.0.0.1`，仅本地访问，更安全
• Enhanced CORS policy with origin validation and exposed headers / 增强 CORS 策略，支持 origin 校验和暴露响应头
• Hardened token exposure and path security defaults / 加固 token 暴露和路径安全默认值
• GPT-5.5 Responses live probes and model-agnostic capability probes / GPT-5.5 Responses 探测和模型无关的能力探测
• Strip unsupported `service_tier` from responses / 剥离不支持的 `service_tier` 字段
• Refactored messages request adaptation and stream finalization / 重构 messages 请求适配和流式终结逻辑

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.5-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.5-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.5-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.5-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.3...v0.7.5](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.3...v0.7.5)

---

# v0.7.3

# What's New / 新功能

## 🔗 Major Upstream Upgrade / 重大上游升级

• Upgraded embedded copilot-proxy from v0.6.3 to v0.7.3 / 内嵌 copilot-proxy 从 v0.6.3 升级到 v0.7.3
• Claude Opus 4.7 routing support / 支持 Claude Opus 4.7 模型路由
• `xhigh` Anthropic effort level preserved end-to-end / `xhigh` Anthropic effort 级别端到端保留
• Massively simplified API routing policy (net -3600 lines upstream) / 大幅简化 API 路由策略（上游净删 3600 行）
• Responses proxy aligned with Copilot capabilities / Responses 代理与 Copilot 能力对齐

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.6.3...v0.7.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.6.3...v0.7.3)

---

# v0.6.3

# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy to v0.6.3 / 内嵌 copilot-proxy 升级到 v0.6.3
• Native Anthropic `/v1/messages` now preserves top-level `cache_control` (prompt caching works out of the box for Claude Code) / 原生 Anthropic `/v1/messages` 现在保留顶层 `cache_control`（Claude Code 的 prompt caching 开箱即用）

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.6.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.6.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.6.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.6.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.6.2...v0.6.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.6.2...v0.6.3)

---

# v0.6.2

# What's New / 新功能

## 🚀 Stale Config Detection / 残留配置检测

• On startup, detects leftover proxy config in `~/.claude/settings.json` from a previous session / 启动时自动检测上次会话残留在 `~/.claude/settings.json` 中的代理配置
• Shows a dialog to keep, remove, or dismiss the stale config — no more silent auto-sync / 弹窗提示保留、清除或稍后处理，不再静默自动同步
• Replaces the old auto-sync behavior that could overwrite user changes / 取代旧的自动同步行为，避免覆盖用户自定义配置

## 🔗 Upstream Upgrade / 上游升级

• Updated copilot-proxy submodule: Claude thinking replay fix, CI runtime improvements / 更新 copilot-proxy 子模块：Claude thinking replay 修复、CI 运行时优化

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.6.2-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.6.2-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.6.2-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.6.2-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.6.1...v0.6.2](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.6.1...v0.6.2)

---

# v0.6.1

# What's New / 新功能

## 🔗 Major Upstream Upgrade / 重大上游升级

• Upgrade embedded copilot-proxy from v0.4.2 to v0.6.1 / 内嵌的 copilot-proxy 从 v0.4.2 大版本升级到 v0.6.1
• Native Anthropic `/v1/messages` passthrough for Claude models / 原生 Anthropic `/v1/messages` 直通支持 Claude 模型
• Anthropic document blocks support (PDF/text extraction) / Anthropic 文档块支持（PDF/文本提取）
• Cross-protocol API translation layer for three-endpoint compatibility / 跨协议 API 翻译层，三端点兼容
• Copilot capability probes and routing improvements / Copilot 能力探测和路由优化
• Centralized backend routing and fallback planning / 集中化后端路由和回退规划
• Structured outputs and embeddings fixes / 结构化输出和嵌入修复
• Abort-signal regression fix (v0.6.1) / abort-signal 回归修复

## 🔢 Version Alignment / 版本号对齐

• GUI version aligned with embedded proxy version (0.3.7 → 0.6.1) / GUI 版本号与内嵌代理版本对齐，减少混淆

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.6.1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.6.1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.6.1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.6.1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.7...v0.6.1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.7...v0.6.1)

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
