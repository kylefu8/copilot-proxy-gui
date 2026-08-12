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

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.9.3...v0.10.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.9.3...v0.10.0)
