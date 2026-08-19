# What's New / 新功能

## 👤 Single-Account Transition / 单账号切换

• Replaced the impossible “delete the only account” action with an explicit “Exit Multi-account” flow / 将必然失败的“删除唯一账号”操作改为明确的“退出多账号模式”流程
• The final account token is first written to Electron encrypted storage, `accounts.json` is renamed to a timestamped backup, and account token files are preserved for recovery / 最后一个账号的 Token 会先写入 Electron 加密存储，`accounts.json` 改名为带时间戳的备份，并保留账号 Token 文件以便恢复
• Added runtime/account-lock and configuration-snapshot checks so concurrent changes fail safely without removing the active configuration / 新增 runtime/account lock 与配置快照检查，并发变化时安全失败，不移除当前配置
• Returning to multi-account mode remains available through “Migrate Current Login” or a fresh Device Flow login / 之后仍可通过“迁移当前登录”或重新执行 Device Flow 再次启用多账号模式

## 🧭 Clear Account Feedback / 清晰的账号反馈

• Account CLI failures now remove ANSI terminal controls and diagnostic noise, then show actionable bilingual messages for duplicate identities, referenced accounts, invalid logins, and runtime locks / 账号 CLI 错误现在会移除 ANSI 控制码与诊断噪音，并针对重复身份、账号引用、登录失效及运行锁显示可操作的双语提示
• Invalid GitHub credentials are shown as a direct re-authentication prompt instead of a raw `Failed to get GitHub user` model-command error / GitHub 凭据失效时直接提示重新登录，不再显示原始 `Failed to get GitHub user` 模型命令错误
• A successfully loaded empty catalog now shows “No models available” with subscription/account-type guidance instead of remaining on “Loading model list” / 模型目录成功加载但为空时，显示“无可用模型”及订阅/账号类型提示，不再停留在“正在加载模型列表”

## 🔗 Device Verification / 设备验证

• Clicking the GitHub Device Flow verification link now always opens the system default browser and never navigates inside the verification-code popup / 点击 GitHub Device Flow 验证链接时始终使用系统默认浏览器，不再在验证码弹窗内导航
• External navigation is restricted to the official `https://github.com/login/device` URL / 外部导航仅允许官方 `https://github.com/login/device` 地址

## 🔧 Compatibility / 兼容性

• Keeps the embedded `copilot-proxy` and conversation-recording fork unchanged from `v0.10.0` / 内嵌 `copilot-proxy` 与对话记录 fork 保持 `v0.10.0` 不变
• Existing multi-account data, routes, themes, Claude Code integration, lightweight updates, and single-account authentication remain compatible / 现有多账号数据、路由、主题、Claude Code 集成、轻量更新及单账号认证保持兼容

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.10.0-1-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.10.0-1-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.10.0-1-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.10.0-1-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app -> Open -> click "Open" in the dialog. If blocked, go to System Settings -> Privacy & Security -> click "Open Anyway".
> 右键点击应用 -> 打开 -> 在弹窗中点击"打开"。如被阻止，前往系统设置 -> 隐私与安全性 -> 点击"仍要打开"。

Full Changelog: [v0.10.0...v0.10.0-1](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.10.0...v0.10.0-1)
