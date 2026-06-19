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
