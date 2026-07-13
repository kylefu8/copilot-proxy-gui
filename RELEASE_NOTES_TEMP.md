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

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.8.0...v0.8.0-1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.8.0...v0.8.0-1)
