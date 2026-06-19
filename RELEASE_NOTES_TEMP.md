# What's New / 新功能

## Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.11 to v0.7.15 / 内嵌 copilot-proxy 从 v0.7.11 升级到 v0.7.15
• Removed hidden Claude variant routing and now preserves upstream context/fast beta signals while normalizing historical Claude model IDs / 移除隐藏 Claude 变体路由，改为规范化历史模型名并保留上游 context/fast beta 信号
• Expanded Claude upstream capability coverage, including safer handling for native server-side tools and Anthropic-to-Responses translation boundaries / 扩展 Claude 上游能力覆盖，包括原生服务端工具和 Anthropic 到 Responses 转换边界的处理

## Reliability / 稳定性

• Hardened streaming cancellation and recovery so aborted clients do not leave upstream streams running unnecessarily / 加强流式取消与恢复逻辑，客户端断开时不再无谓保留上游流
• Tightened token handling by rejecting token exposure in daemon/supervisor logging paths / 收紧 token 处理，避免 daemon/supervisor 日志路径暴露 token
• Switched autostart toward native service managers on Windows/macOS/Linux while retaining legacy daemon compatibility / 自动启动改向 Windows/macOS/Linux 原生服务管理器，同时保留旧 daemon 兼容

## Compatibility / 兼容性

• Rebased local conversation recording patches onto `conv-middleware-v0715` with no conflicts / 本地对话记录补丁已无冲突重放到 `conv-middleware-v0715`
• Kept the Electron JavaScript bundle packaging path unchanged / Electron JavaScript bundle 打包路径保持不变

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.15-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.15-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.15-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.15-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.11...v0.7.15](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.11...v0.7.15)
