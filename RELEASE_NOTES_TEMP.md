# What's New / 新功能

## � Upstream Sync / 上游同步

• Upstream PR merged: Anthropic `/v1/messages` compatibility fix is now official (`Jer-y/copilot-proxy#2`) / 上游 PR 已合并：Anthropic `/v1/messages` 兼容性修复已正式进入上游
• Submodule restored to upstream `Jer-y/copilot-proxy` (merge commit `b162b63`, ahead of upstream `v0.3.1`) / 子模块恢复指向上游，当前版本比上游正式发布 `v0.3.1` 更新

## 🚀 UX / 体验优化

• Auto-refresh usage on first panel expand after app launch / 程序启动后首次展开用量面板时自动刷新用量
• About page now shows the app logo instead of a generic emoji / 关于页面现在显示应用 logo 而非通用 emoji

## 📐 Window Height Fix / 窗口高度修复

• Fix excessive bottom whitespace on Windows by compensating for title bar / border frame in `resizeWindow` / 修复 Windows 下窗口底部留白过多的问题，`resizeWindow` 现在正确补偿标题栏/边框尺寸
• Platform-specific padding: Windows uses tighter padding while macOS remains unchanged / 平台差异化 padding：Windows 使用更紧凑的间距，macOS 保持不变
• Fix applies to Main view, Settings page, and About page / 修复覆盖主界面、设置页面和关于页面

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.2.9...v0.3.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.2.9...v0.3.0)
