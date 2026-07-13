# What's New / 新功能

## 🔗 Upstream Upgrade / 上游升级

• Upgraded the embedded copilot-proxy from upstream `v0.7.15` to `v0.8.0` / 内嵌 copilot-proxy 从上游 `v0.7.15` 升级到 `v0.8.0`
• Included official GPT-5.6 family support from upstream `v0.7.16` / 纳入上游 `v0.7.16` 正式发布的 GPT-5.6 系列支持
• Added stricter host, CORS, token exposure, request translation, and native-service lifecycle protections / 加强 Host、CORS、token 暴露、请求转换和原生服务生命周期保护
• Requests that cannot be translated faithfully now return a clear `400` instead of silently dropping fields / 无法可靠转换的请求现在会明确返回 `400`，不再静默丢弃字段

## 🔧 Runtime Compatibility / 运行时兼容性

• Upgraded Electron from `33.4.11` to `41.10.1`, moving the packaged runtime from Node `20.18.3` to Node `24.18.0` / Electron 从 `33.4.11` 升级到 `41.10.1`，打包运行时由 Node `20.18.3` 升级到 Node `24.18.0`
• Preserved local conversation recording middleware on the new `conv-middleware-v080` branch / 在新的 `conv-middleware-v080` 分支上保留本地对话记录中间件
• Non-loopback deployments must explicitly configure `COPILOT_PROXY_ALLOWED_HOSTS` and `COPILOT_PROXY_CORS_ORIGINS`; the GUI's default localhost mode continues to work without extra configuration / 非回环地址部署需显式配置 `COPILOT_PROXY_ALLOWED_HOSTS` 和 `COPILOT_PROXY_CORS_ORIGINS`；GUI 默认 localhost 模式无需额外配置

## Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.8.0-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.8.0-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.8.0-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.8.0-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.7.15-3...v0.8.0](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.7.15-3...v0.8.0)
