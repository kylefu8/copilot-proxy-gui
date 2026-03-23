# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgrade embedded copilot-proxy from v0.4.1 to v0.4.2 / 内嵌的 copilot-proxy 从 v0.4.1 升级到 v0.4.2
• Fix Claude Code stalls on Anthropic messages / 修复 Claude Code 在 Anthropic messages 接口上卡住的问题

## 🚀 Claude Code Skip Permissions / Claude Code 跳过权限确认

• New setting to launch Claude Code with `--dangerously-skip-permissions` / 新增设置项，启动 Claude Code 时附加 `--dangerously-skip-permissions` 参数
• Two-stage safety confirmation: danger dialog on enable + danger dialog on launch / 两阶段安全确认：开启时弹窗确认 + 启动时二次确认
• Red-themed danger dialogs with full Chinese/English bilingual support / 红色警告风格弹窗，完整中英文双语支持
• Shared `DangerConfirmDialog` component reused across settings and main view / 共享 `DangerConfirmDialog` 组件，设置页和主界面复用
• Danger dialog styles auto-adapt to all 5 built-in themes / 危险弹窗样式自动适配全部 5 套内置主题

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.6-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.6-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.6-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.6-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.5...v0.3.6](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.5...v0.3.6)
