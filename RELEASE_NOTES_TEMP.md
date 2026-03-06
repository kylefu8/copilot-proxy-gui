# What's New / 新功能

## 🚀 Proxy Upgrade / Proxy 升级

• Upgrade embedded `copilot-proxy` to upstream `v0.3.0` / 内嵌的 `copilot-proxy` 升级到上游 `v0.3.0`
• Restore compatibility for Anthropic `/v1/messages` requests without `max_tokens` / 恢复对未携带 `max_tokens` 的 Anthropic `/v1/messages` 请求兼容性

## 🚀 UX / 体验优化

• Main screen adds a dedicated model refresh button next to Claude Code actions / 主界面在 Claude Code 操作区新增独立的模型刷新按钮
• If Claude Code persistent config already exists, changing models now auto-syncs `~/.claude/settings.json` / 如果已存在 Claude Code 持久化配置，切换模型后会自动同步 `~/.claude/settings.json`
• Usage refresh button now uses the usage icon and clearer text / 用量刷新按钮改为带用量图标，并使用更清晰的按钮名称
• Settings button icon updated to a new gear emoji / 设置按钮图标更新为新的齿轮 emoji

## 📋 Verbose Logs / 详细日志

• Model refresh actions now appear in Verbose logs / 刷新模型列表的动作现在会显示在 Verbose 日志中
• Log viewer keeps incremental rendering and auto-trims to 500 lines for responsiveness / 日志窗口继续保持增量渲染，并自动裁剪到 500 行以内以保证流畅度

## 🔧 Bug Fixes / 问题修复

• Fix lightweight update ENOENT error: use `original-fs` for all `.asar` file operations including temp directory writes / 修复轻量更新 ENOENT 报错：对所有涉及 `.asar` 的文件操作使用 `original-fs`，包括临时目录写入

## 🛠 Developer Experience / 开发体验

• Dev mode (`COPILOT_GUI_DEV=1`) now skips single-instance lock, allowing parallel dev and production instances / 开发模式下跳过单实例检测，允许开发版和正式版同时运行

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.2.9-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.2.9-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.2.9-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.2.9-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.2.8...v0.2.9](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.2.8...v0.2.9)
