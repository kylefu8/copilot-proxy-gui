# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.8.0` to `v0.9.0` / 内嵌 copilot-proxy 从上游 `v0.8.0` 升级到 `v0.9.0`
• Added native Responses WebSocket support, bounded Copilot authentication recovery, optional concurrency limits, and `/livez`/`/readyz` health endpoints / 新增原生 Responses WebSocket、受限的 Copilot 认证恢复、可选并发限制及 `/livez`/`/readyz` 健康检查端点
• Included stricter protocol fidelity, stable Responses item IDs, and Windows native-service fixes / 纳入更严格的协议保真、稳定的 Responses item ID 和 Windows 原生服务修复

## 🔧 GUI Startup Compatibility / GUI 启动兼容修复

• Fixed the GUI repeatedly passing `--github-token`, which copilot-proxy `0.8+` treats as a save-and-exit bootstrap instead of a long-running server option / 修复 GUI 每次传入 `--github-token` 导致 copilot-proxy `0.8+` 保存后立即退出的问题
• The encrypted GUI token is now supplied through the supported one-shot `GH_TOKEN` environment input and removed from long-running command-line arguments / GUI 加密保存的 Token 现在通过受支持的一次性 `GH_TOKEN` 环境输入传递，不再出现在长期进程命令行参数中
• Explicitly allows the GUI's `localhost`, `127.0.0.1`, and `::1` callers while preserving any existing `COPILOT_PROXY_ALLOWED_HOSTS` entries / 显式允许 GUI 使用的 `localhost`、`127.0.0.1` 和 `::1`，同时保留现有 `COPILOT_PROXY_ALLOWED_HOSTS` 配置

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.9.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.9.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.9.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.9.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.8.0-1...v0.9.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.8.0-1...v0.9.0)
