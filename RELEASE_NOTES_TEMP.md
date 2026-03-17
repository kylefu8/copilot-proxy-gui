# What's New / 新功能

## 💬 Conversation Recording / 对话记录

• Record full request/response content to local JSON files (streaming auto-assembled) / 完整记录请求与 AI 回复到本地 JSON 文件（流式自动拼接）
• Built-in conversation viewer with session sidebar and message panel / 内置对话浏览器，左栏会话列表 + 右栏消息面板
• Auto-detect client type: Claude Code, Cursor, Continue, Cline, etc. / 自动识别客户端来源
• Session grouping by client + model with 15-min idle timeout / 按客户端+模型分组会话，15 分钟空闲自动断开
• Sessions organized by date (Today / Yesterday / older dates) / 会话按日期归类
• Full-text search with matching text highlight / 全文搜索，匹配文本高亮显示
• Multi-select sessions + batch delete / 多选会话 + 批量删除
• Real-time push: new entries appear instantly in open viewer / 实时推送：新对话即时出现在浏览器中
• Theme and language sync with main window / 配色与语言跟随主窗口实时切换
• Toggle in Settings > Service Config (off by default, requires service restart) / 在设置 > 服务参数中开关控制（默认关闭，需重启服务生效）

## 🔧 Architecture / 架构改进

• Refactored from handler-level hooks to a single Hono middleware / 从分散的 handler hook 重构为统一的 Hono 中间件
• Only 2 lines added to upstream server.ts (import + use), zero handler changes / 上游 server.ts 仅增加 2 行，handler 零修改
• Eliminates merge conflict risk when upstream updates handlers / 消除上游更新 handler 时的合并冲突风险

## 🚀 UX / 体验优化

• Reorder header buttons: Theme → Language → Conversations → Logs → Settings → About / 顶栏按钮重新排序
• Recording toggle moved to Settings page / 记录开关移至设置页面
• Fix settings checkbox alignment / 修复设置页面复选框对齐

## ⬇️ Download / 下载

| Platform | File | Note |
| -------- | ---- | ---- |
| Windows (Installer) | Copilot.Proxy.GUI-0.3.3-setup.exe | **Recommended** / 推荐，supports lightweight update / 支持轻量更新 |
| Windows (Portable) | Copilot.Proxy.GUI-0.3.3-portable.exe | No installation needed / 无需安装，双击即用 |
| macOS (Apple Silicon) | Copilot.Proxy.GUI-0.3.3-arm64.dmg | M1/M2/M3/M4 Mac |
| macOS (Intel) | Copilot.Proxy.GUI-0.3.3-x64.dmg | Intel Mac |

> macOS first launch / macOS 首次启动: Right-click the app → Open → click "Open" in the dialog. If blocked, go to System Settings → Privacy & Security → click "Open Anyway".
> 右键点击应用 → 打开 → 在弹窗中点击"打开"。如被阻止，前往系统设置 → 隐私与安全性 → 点击"仍要打开"。

Full Changelog: [v0.3.2...v0.3.3](https://github.com/kylefu8/copilot-proxy-gui/compare/v0.3.2...v0.3.3)
