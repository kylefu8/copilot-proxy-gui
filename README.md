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

## 中文

基于 Electron + React + Vite 的桌面 GUI，为 [copilot-proxy](https://github.com/Jer-y/copilot-proxy) 提供图形化管理界面，无需命令行即可管理代理服务。

### 功能

- GitHub OAuth 登录（Device Code 流程，内置验证码弹窗）
- 自动检测账号类型（个人 / 商业 / 企业）
- 服务启停，实时日志查看（可调字号、自动滚动）
- 模型列表拉取 & 默认模型 / 快速模型选择（选择即保存）
- Claude Code 集成：一键启动 & 写入/清除 `~/.claude/settings.json` 配置
- 用量看板（配额进度条 + 详细数据折叠展示）
- 风险声明对话框（首次启动弹出，需接受后方可启动服务）
- 5 套内置主题：Lavender (Frost)、Peach (Sakura)、Cherry、Midnight、Aurora
- 配置管理：端口、账号类型、详细日志、手动审批、速率限制等
- 系统托盘：启停控制、模型信息、最小化到托盘
- 中英文双语支持（一键切换，首次启动自动检测系统语言）
- Claude Code 安装检测（未安装时提示并禁用相关按钮）
- 跨平台支持：Windows 和 macOS（arm64 + x64）
- 关闭窗口行为可配置（最小化到托盘 / 退出 / 每次询问，支持记住选择）

### 快速开始

#### 下载安装

从 [Releases](https://github.com/kylefu8/copilot-proxy-gui/releases) 页面下载：

- **Windows**：便携版（`.exe`），双击即用，无需安装
- **macOS**：DMG 安装包（arm64 适用于 Apple Silicon，x64 适用于 Intel）

> **macOS 首次打开提示**
>
> 由于应用未经 Apple 公证，macOS 会提示"无法验证开发者"。请按以下步骤操作：
>
> 1. 双击 DMG 挂载，将应用拖入 Applications
> 2. **右键（或 Control+点击）** 应用图标 → 选择 **"打开"** → 在弹窗中点 **"打开"**
> 3. 如果右键没有"打开"选项，前往 **系统设置 → 隐私与安全性**，滚到底部点击 **"仍要打开"**
> 4. 只需首次操作，之后可正常双击打开

#### 从源码运行

```sh
# 克隆仓库（含子模块）
git clone --recurse-submodules https://github.com/kylefu8/copilot-proxy-gui.git
cd copilot-proxy-gui

# 安装依赖
npm install

# 安装 proxy 依赖
cd copilot-proxy && bun install && cd ..

# 开发模式启动
npm run desktop:dev
```

#### 构建可执行文件

```sh
npm run desktop:build
```

产物在 `release/` 目录下。

### 技术栈

- 前端：React 18 + Vite 5
- 桌面壳：Electron 33
- 代理服务：[copilot-proxy](https://github.com/Jer-y/copilot-proxy)（git submodule）

### 代理服务联动

GUI 默认请求本地 `http://localhost:4399`，可在设置页修改端口。

关闭窗口时会自动停止 proxy 子进程。

### IPC 命令

| 命令 | 说明 |
|------|------|
| `service_start` | 启动代理服务 |
| `service_stop` | 停止代理服务 |
| `service_logs` | 获取服务日志 |
| `auth_status` | 检查 token 状态 |
| `auth_device_code_start` | 启动 Device Code 登录流程 |
| `delete_token` | 删除已保存 token |
| `fetch_models` | 拉取模型列表 |
| `detect_account_type` | 检测账号类型 |
| `launch_claude_code` | 启动 Claude Code |
| `write_claude_env` | 写入 Claude 配置 |
| `clear_claude_env` | 清除 Claude 配置 |
| `check_claude_env` | 检查 Claude 配置 |
| `check_claude_installed` | 检查 Claude Code 是否已安装 |
| `open_external` | 打开外部链接 |
| `resize_window` | 调整窗口大小 |

### 致谢

本项目基于 [copilot-proxy](https://github.com/Jer-y/copilot-proxy)（by [Jer-y](https://github.com/Jer-y)）开发，核心代理服务实现来自该项目，特此感谢！

---

## English

A desktop GUI for [copilot-proxy](https://github.com/Jer-y/copilot-proxy), built with Electron + React + Vite. Manage the proxy service without the command line.

### Features

- GitHub OAuth login (Device Code flow, built-in verification code popup)
- Auto-detect account type (individual / business / enterprise)
- Service start/stop, real-time log viewer (adjustable font size, auto-scroll)
- Model list fetching & default/fast model selection (saves on select)
- Claude Code integration: one-click launch & write/clear `~/.claude/settings.json`
- Usage dashboard (quota progress bar + collapsible detail view)
- Risk disclaimer dialog (shown on first launch, must accept before starting)
- 5 built-in themes: Lavender (Frost), Peach (Sakura), Cherry, Midnight, Aurora
- Settings: port, account type, verbose logging, manual approval, rate limiting, etc.
- System tray: start/stop, model info, minimize to tray
- Chinese/English bilingual support (one-click toggle, auto-detects system language on first launch)
- Claude Code installation check (warns and disables buttons if not installed)
- Cross-platform support: Windows & macOS (arm64 + x64)
- Configurable close behavior (minimize to tray / quit / ask each time, with remember option)

### Quick Start

#### Download

Download from the [Releases](https://github.com/kylefu8/copilot-proxy-gui/releases) page:

- **Windows**: Portable edition (`.exe`, no installation required)
- **macOS**: DMG installer (arm64 for Apple Silicon, x64 for Intel)

> **macOS First Launch Note**
>
> The app is not notarized by Apple, so macOS will show a warning. To open it:
>
> 1. Double-click the DMG to mount, then drag the app to Applications
> 2. **Right-click (or Control+click)** the app → select **"Open"** → click **"Open"** in the dialog
> 3. If "Open" is not available, go to **System Settings → Privacy & Security**, scroll down and click **"Open Anyway"**
> 4. This is only needed the first time; after that you can double-click to open normally

#### Run from Source

```sh
# Clone the repo (with submodules)
git clone --recurse-submodules https://github.com/kylefu8/copilot-proxy-gui.git
cd copilot-proxy-gui

# Install dependencies
npm install

# Install proxy dependencies
cd copilot-proxy && bun install && cd ..

# Start in dev mode
npm run desktop:dev
```

#### Build

```sh
npm run desktop:build
```

Output is in the `release/` directory.

### Tech Stack

- Frontend: React 18 + Vite 5
- Desktop shell: Electron 33
- Proxy service: [copilot-proxy](https://github.com/Jer-y/copilot-proxy) (git submodule)

### Proxy Integration

The GUI connects to local `http://localhost:4399` by default. The port can be changed in Settings.

The proxy child process is automatically stopped when the window is closed.

### IPC Commands

| Command | Description |
|---------|-------------|
| `service_start` | Start proxy |
| `service_stop` | Stop proxy |
| `service_logs` | Get logs |
| `auth_status` | Check token status |
| `auth_device_code_start` | Start Device Code login |
| `delete_token` | Delete saved token |
| `fetch_models` | Fetch model list |
| `detect_account_type` | Detect account type |
| `launch_claude_code` | Launch Claude Code |
| `write_claude_env` | Write Claude config |
| `clear_claude_env` | Clear Claude config |
| `check_claude_env` | Check Claude config |
| `check_claude_installed` | Check if Claude Code CLI is installed |
| `open_external` | Open external link |
| `resize_window` | Resize window |

### Acknowledgments

This project is based on [copilot-proxy](https://github.com/Jer-y/copilot-proxy) by [Jer-y](https://github.com/Jer-y). Special thanks!

## License

[MIT](LICENSE)
