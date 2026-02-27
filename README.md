# Copilot Proxy GUI

Windows / macOS / Linux 桌面 GUI，基于 Electron + React + Vite。

为 [copilot-proxy](https://github.com/Jer-y/copilot-proxy) 提供图形化管理界面，让你无需命令行即可管理代理服务。

## 功能

- GitHub OAuth 登录（Device Code 流程，内置验证码弹窗）
- 自动检测账号类型（individual / business / enterprise）
- 服务启停，实时日志查看（可调字号、自动滚动）
- 模型列表拉取 & 默认模型 / 快速模型选择（选择即保存）
- Claude Code 集成：一键启动 & 写入/清除 `~/.claude/settings.json` 配置
- 用量看板（配额进度条 + 详细数据折叠展示）
- 风险声明对话框（首次启动或配置变更时弹出，需接受后方可启动服务）
- 5 套内置主题：薰衣草 (Frost)、蜜桃 (Sakura)、樱花 (Cherry)、星空 (Midnight)、极光 (Aurora)
- 配置管理：端口、账号类型、详细日志、手动审批、速率限制等，支持一键重置
- 系统托盘：启停控制、模型信息、最小化到托盘
- 中英文双语支持（一键切换）
- 关闭窗口行为可配置（最小化到托盘 / 退出 / 每次询问，支持记住选择）

## 快速开始

### 下载安装

从 [Releases](https://github.com/kylefu8/copilot-proxy-gui/releases) 页面下载：

- **Windows**: Portable 便携版 (`.exe`，无需安装，双击即用)

> macOS / Linux 版本暂未提供预编译包，请从源码构建。

### 从源码运行

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

### 构建可执行文件

```sh
npm run desktop:build
```

产物在 `release/` 目录下。

## 技术栈

- 前端：React 18 + Vite 5
- 桌面壳：Electron 33
- 代理服务：[copilot-proxy](https://github.com/Jer-y/copilot-proxy)（以 git submodule 形式引入）

## 与代理服务联动

GUI 默认请求本地 `http://localhost:4399`。可在设置页修改端口。

关闭窗口时会自动停止 proxy 子进程。

## Electron IPC 命令

| 命令 | 说明 |
|------|------|
| `service_start` | 启动 proxy 服务 |
| `service_stop` | 停止 proxy 服务 |
| `service_logs` | 获取服务日志 |
| `auth_status` | 检查 GitHub token 状态 |
| `auth_device_code_start` | 启动 GitHub Device Code 登录流程 |
| `delete_token` | 删除已保存的 GitHub token |
| `fetch_models` | 拉取可用模型列表 |
| `detect_account_type` | 自动检测 Copilot 账号类型 |
| `launch_claude_code` | 启动 Claude Code |
| `write_claude_env` | 写入 Claude Code 配置到 settings.json |
| `clear_claude_env` | 清除 Claude Code 配置 |
| `check_claude_env` | 检查 Claude Code 配置状态 |
| `open_external` | 用系统浏览器打开外部链接 |
| `resize_window` | 调整窗口大小 |

## 致谢

本项目基于 [copilot-proxy](https://github.com/Jer-y/copilot-proxy)（by [Jer-y](https://github.com/Jer-y)）开发，核心代理服务实现来自该项目，特此感谢！

## License

[MIT](LICENSE)
