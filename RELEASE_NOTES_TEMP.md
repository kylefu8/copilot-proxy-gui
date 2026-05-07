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
