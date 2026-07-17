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

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.15-3...v0.9.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-3...v0.9.0)
