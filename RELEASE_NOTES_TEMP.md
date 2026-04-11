# What's New / 新功能

## 🚀 Stale Config Detection / 残留配置检测

• On startup, detects leftover proxy config in `~/.claude/settings.json` from a previous session / 启动时自动检测上次会话残留在 `~/.claude/settings.json` 中的代理配置
• Shows a dialog to keep, remove, or dismiss the stale config — no more silent auto-sync / 弹窗提示保留、清除或稍后处理，不再静默自动同步
• Replaces the old auto-sync behavior that could overwrite user changes / 取代旧的自动同步行为，避免覆盖用户自定义配置

## 🔗 Upstream Upgrade / 上游升级

• Updated copilot-proxy submodule: Claude thinking replay fix, CI runtime improvements / 更新 copilot-proxy 子模块：Claude thinking replay 修复、CI 运行时优化

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.6.2-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.6.2-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.6.2-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.6.2-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.6.1...v0.6.2](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.6.1...v0.6.2)
