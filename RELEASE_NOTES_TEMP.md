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
