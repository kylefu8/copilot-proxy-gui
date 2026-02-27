# Copilot Proxy GUI

> [!WARNING]
> This is a reverse-engineered proxy of GitHub Copilot API. It is **not supported by GitHub**, and may break unexpectedly. Use at your own risk.

> [!WARNING]
> **GitHub Security Notice:**
> Excessive automated or scripted use of Copilot (including rapid or bulk requests, such as via automated tools) may trigger GitHub's abuse-detection systems.
> You may receive a warning from GitHub Security, and further anomalous activity could result in **temporary suspension** of your Copilot access.
>
> GitHub prohibits use of their servers for excessive automated bulk activity or any activity that places undue burden on their infrastructure.
>
> Please review:
>
> - [GitHub Acceptable Use Policies](https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies#4-spam-and-inauthentic-activity-on-github)
> - [GitHub Copilot Terms](https://docs.github.com/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
>
> Use this proxy responsibly to avoid account restrictions.

---

A desktop GUI for [copilot-proxy](https://github.com/Jer-y/copilot-proxy), built with Electron + React + Vite. Manage the proxy service without the command line.

基于 Electron + React + Vite 的桌面 GUI，为 [copilot-proxy](https://github.com/Jer-y/copilot-proxy) 提供图形化管理界面，无需命令行即可管理代理服务。

## Features / 功能

- GitHub OAuth login (Device Code flow, built-in verification code popup) / GitHub OAuth 登录（Device Code 流程，内置验证码弹窗）
- Auto-detect account type (individual / business / enterprise) / 自动检测账号类型
- Service start/stop, real-time log viewer (adjustable font size, auto-scroll) / 服务启停，实时日志查看（可调字号、自动滚动）
- Model list fetching & default/fast model selection (saves on select) / 模型列表拉取 & 默认模型 / 快速模型选择（选择即保存）
- Claude Code integration: one-click launch & write/clear `~/.claude/settings.json` / Claude Code 集成：一键启动 & 写入/清除配置
- Usage dashboard (quota progress bar + collapsible detail view) / 用量看板（配额进度条 + 详细数据折叠展示）
- Risk disclaimer dialog (shown on first launch, must accept before starting) / 风险声明对话框（首次启动弹出，需接受后方可启动服务）
- 5 built-in themes: Lavender (Frost), Peach (Sakura), Cherry, Midnight, Aurora / 5 套内置主题
- Settings: port, account type, verbose logging, manual approval, rate limiting, etc. / 配置管理：端口、账号类型、详细日志、手动审批、速率限制等
- System tray: start/stop, model info, minimize to tray / 系统托盘：启停控制、模型信息、最小化到托盘
- Chinese/English bilingual support (one-click toggle) / 中英文双语支持（一键切换）
- Configurable close behavior (minimize to tray / quit / ask each time, with remember option) / 关闭窗口行为可配置

## Quick Start / 快速开始

### Download / 下载安装

Download from the [Releases](https://github.com/kylefu8/copilot-proxy-gui/releases) page:

从 [Releases](https://github.com/kylefu8/copilot-proxy-gui/releases) 页面下载：

- **Windows**: Portable edition (`.exe`, no installation required) / 便携版，双击即用

> macOS / Linux pre-built binaries are not available yet. Please build from source.
>
> macOS / Linux 版本暂未提供预编译包，请从源码构建。

### Run from Source / 从源码运行

```sh
# Clone the repo (with submodules) / 克隆仓库（含子模块）
git clone --recurse-submodules https://github.com/kylefu8/copilot-proxy-gui.git
cd copilot-proxy-gui

# Install dependencies / 安装依赖
npm install

# Install proxy dependencies / 安装 proxy 依赖
cd copilot-proxy && bun install && cd ..

# Start in dev mode / 开发模式启动
npm run desktop:dev
```

### Build / 构建可执行文件

```sh
npm run desktop:build
```

Output is in the `release/` directory. / 产物在 `release/` 目录下。

## Tech Stack / 技术栈

- Frontend / 前端：React 18 + Vite 5
- Desktop shell / 桌面壳：Electron 33
- Proxy service / 代理服务：[copilot-proxy](https://github.com/Jer-y/copilot-proxy) (git submodule)

## Proxy Integration / 与代理服务联动

The GUI connects to local `http://localhost:4399` by default. The port can be changed in Settings.

GUI 默认请求本地 `http://localhost:4399`，可在设置页修改端口。

The proxy child process is automatically stopped when the window is closed. / 关闭窗口时会自动停止 proxy 子进程。

## Electron IPC Commands / IPC 命令

| Command / 命令 | Description / 说明 |
|---------|-------------|
| `service_start` | Start proxy / 启动代理服务 |
| `service_stop` | Stop proxy / 停止代理服务 |
| `service_logs` | Get logs / 获取服务日志 |
| `auth_status` | Check token status / 检查 token 状态 |
| `auth_device_code_start` | Start Device Code login / 启动登录流程 |
| `delete_token` | Delete saved token / 删除已保存 token |
| `fetch_models` | Fetch model list / 拉取模型列表 |
| `detect_account_type` | Detect account type / 检测账号类型 |
| `launch_claude_code` | Launch Claude Code / 启动 Claude Code |
| `write_claude_env` | Write Claude config / 写入 Claude 配置 |
| `clear_claude_env` | Clear Claude config / 清除 Claude 配置 |
| `check_claude_env` | Check Claude config / 检查 Claude 配置 |
| `open_external` | Open external link / 打开外部链接 |
| `resize_window` | Resize window / 调整窗口大小 |

## Acknowledgments / 致谢

This project is based on [copilot-proxy](https://github.com/Jer-y/copilot-proxy) by [Jer-y](https://github.com/Jer-y). Special thanks!

本项目基于 [copilot-proxy](https://github.com/Jer-y/copilot-proxy)（by [Jer-y](https://github.com/Jer-y)）开发，核心代理服务实现来自该项目，特此感谢！

## License

[MIT](LICENSE)
