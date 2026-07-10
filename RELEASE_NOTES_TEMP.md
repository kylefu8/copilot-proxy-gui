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
