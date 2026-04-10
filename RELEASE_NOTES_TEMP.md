# What's New / 新功能

## 🔗 Major Upstream Upgrade / 重大上游升级

• Upgrade embedded copilot-proxy from v0.4.2 to v0.6.1 / 内嵌的 copilot-proxy 从 v0.4.2 大版本升级到 v0.6.1
• Native Anthropic `/v1/messages` passthrough for Claude models / 原生 Anthropic `/v1/messages` 直通支持 Claude 模型
• Anthropic document blocks support (PDF/text extraction) / Anthropic 文档块支持（PDF/文本提取）
• Cross-protocol API translation layer for three-endpoint compatibility / 跨协议 API 翻译层，三端点兼容
• Copilot capability probes and routing improvements / Copilot 能力探测和路由优化
• Centralized backend routing and fallback planning / 集中化后端路由和回退规划
• Structured outputs and embeddings fixes / 结构化输出和嵌入修复
• Abort-signal regression fix (v0.6.1) / abort-signal 回归修复

## 🔢 Version Alignment / 版本号对齐

• GUI version aligned with embedded proxy version (0.3.7 → 0.6.1) / GUI 版本号与内嵌代理版本对齐，减少混淆

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.6.1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.6.1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.6.1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.6.1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.7...v0.6.1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.7...v0.6.1)
