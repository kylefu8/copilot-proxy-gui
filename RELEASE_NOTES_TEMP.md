# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgrade embedded copilot-proxy from v0.3.1 base to upstream v0.4.1 / 内嵌的 copilot-proxy 从 v0.3.1 基线升级到上游 v0.4.1
• HTTP resilience: upstream timeout defaults and SSE keepalive / HTTP 韧性：上游超时默认值和 SSE keepalive
• Improved Anthropic Messages protocol compatibility / 改进的 Anthropic Messages 协议兼容性
• Fix count_tokens JSONResponseError propagation / 修复 count_tokens 的 JSONResponseError 传播

## 🔧 Bug Fixes / 修复

• Fix Claude Code detection on macOS when nvm is used (npm_config_prefix conflict) / 修复 macOS 下使用 nvm 时 Claude Code 检测失败的问题
• Fix missing default-model conversations in viewer on macOS (stdout line splitting) / 修复 macOS 下默认模型对话记录不显示的问题（stdout 行拆分）

## 💬 Conversation Recording / 对话记录

• Middleware architecture maintained: zero handler changes, zero conflict on upgrade / 中间件架构保持不变：handler 零修改，升级零冲突

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.5-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.5-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.5-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.5-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.3...v0.3.5](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.3...v0.3.5)
