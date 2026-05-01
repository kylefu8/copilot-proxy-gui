# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded embedded copilot-proxy from v0.7.3 to v0.7.5 / 内嵌 copilot-proxy 从 v0.7.3 升级到 v0.7.5
• Default bind address changed from `0.0.0.0` to `127.0.0.1` for improved security (loopback only) / 默认监听地址从 `0.0.0.0` 改为 `127.0.0.1`，仅本地访问，更安全
• Enhanced CORS policy with origin validation and exposed headers / 增强 CORS 策略，支持 origin 校验和暴露响应头
• Hardened token exposure and path security defaults / 加固 token 暴露和路径安全默认值
• GPT-5.5 Responses live probes and model-agnostic capability probes / GPT-5.5 Responses 探测和模型无关的能力探测
• Strip unsupported `service_tier` from responses / 剥离不支持的 `service_tier` 字段
• Refactored messages request adaptation and stream finalization / 重构 messages 请求适配和流式终结逻辑

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.7.5-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.7.5-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.7.5-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.7.5-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.7.3...v0.7.5](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.3...v0.7.5)
