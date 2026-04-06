# What's New / 新功能

## 🚀 Auto 1M Context Window for Claude Code / Claude Code 自动 1M 上下文窗口

• Auto-detect models with 1M context and append `[1m]` suffix to Claude Code env vars / 自动检测 1M 上下文模型，在 Claude Code 环境变量中追加 `[1m]` 后缀
• Claude Code recognizes `[1m]` to enable 1M context mode and strips it before API requests / Claude Code 识别 `[1m]` 启用 1M 上下文模式，发送请求前自动剥离后缀
• Only applies to Claude models; GPT, Gemini and other models are not affected / 仅对 Claude 模型生效，GPT、Gemini 等不受影响
• Green hint shown when 1M context is detected / 检测到 1M 上下文时显示绿色提示

## 🔧 Enhanced Model Selector / 增强模型选择器

• Model dropdowns now show context window size, e.g. `claude-opus-4.6-1m (1M)`, `gpt-5.4 (400K)` / 模型下拉框现在显示上下文窗口大小
• Added `ANTHROPIC_DEFAULT_OPUS_MODEL` to env vars, ensuring `/model opus` and `opusplan` route through proxy / 新增 `ANTHROPIC_DEFAULT_OPUS_MODEL` 环境变量，确保 CC 内切换 opus 别名也走代理

## 🔧 Removed Skip-Permissions / 移除跳过权限功能

• Removed experimental `--dangerously-skip-permissions` option and all related UI / 移除实验性的 `--dangerously-skip-permissions` 选项及所有相关 UI

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.7-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.7-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.7-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.7-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.6...v0.3.7](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.6...v0.3.7)
