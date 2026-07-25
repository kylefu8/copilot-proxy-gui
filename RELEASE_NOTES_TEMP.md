# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.9.0` to `v0.9.3` without publishing intermediate GUI versions / 内嵌 copilot-proxy 从上游 `v0.9.0` 升级到 `v0.9.3`，不发布中间 GUI 版本
• Rebased the local conversation recording middleware onto `conv-middleware-v093` while keeping the fork limited to two proxy files / 将本地对话记录中间件重放到 `conv-middleware-v093`，代理 fork 仍仅涉及两个文件

## 🧭 Setup & Diagnostics / 配置与诊断

• Added upstream guided setup, live model inspection, doctor diagnostics, generated Codex/Claude/OpenAI-compatible profiles, and runtime presets / 新增上游引导式配置、实时模型检查、doctor 诊断、Codex/Claude/OpenAI 兼容配置生成及运行预设
• Added the read-only diagnostics API/dashboard data surface and stronger native, legacy, Windows, UNC, shell, and container service handling / 新增只读诊断 API/面板数据，并加强原生服务、旧版服务、Windows、UNC、shell 与容器启动处理
• These upstream CLI and diagnostics capabilities are included in the embedded proxy; this release does not add new GUI pages for them / 内嵌代理已包含这些上游 CLI 与诊断能力，本次不额外新增对应 GUI 页面

## 🧠 Claude & Streaming / Claude 与流式处理

• Added Claude Opus 5 support with verified reasoning, tools, 64K output, and Claude Code 1M selector compatibility / 新增 Claude Opus 5，支持已验证的推理、工具、64K 输出及 Claude Code 1M selector
• Improved model normalization and strict protocol handling for tool changes, fallback boundaries, system blocks, and Responses translation / 改进模型规范化，并严格处理工具变化、fallback 边界、system block 与 Responses 转换
• Keeps idle Anthropic SSE connections alive with periodic ping events during long upstream gaps / 在上游长时间无事件时发送周期性 ping，避免 Anthropic SSE 空闲连接断开

## 🔧 GUI Compatibility / GUI 兼容性

• Preserved encrypted Token startup through one-shot `GH_TOKEN`, loopback Host allowlisting, conversation recording, and Electron `41.10.1` / Node `24.18.0` / 保留一次性 `GH_TOKEN` 加密 Token 启动、本地 Host 白名单、对话记录，以及 Electron `41.10.1` / Node `24.18.0`

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.9.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.9.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.9.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.9.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.9.0...v0.9.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.9.0...v0.9.3)
