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
