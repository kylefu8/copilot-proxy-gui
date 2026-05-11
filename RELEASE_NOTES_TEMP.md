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
