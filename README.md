# Codex with ChatGPT

> ChatGPT thinks. Codex works.
> ChatGPT 负责思考，Codex 负责干活。

## The problem · 解决什么问题

**EN** — If you pay for ChatGPT (Plus/Pro), you're sitting on a pile of
web-app quota for OpenAI's strongest models that mostly goes unused — while
your coding agent burns through scarce, per-token API/Codex quota doing the
heaviest thinking: understanding the codebase, planning, and reviewing.

This project fixes that split. It offloads the expensive "brain work"
(analysis, planning, code review) to the ChatGPT **web subscription you
already pay for**, and keeps Codex focused on what it's best at — executing:
editing files, running shells and tests, committing. Your API/Codex quota is
spent almost entirely on doing, not thinking. No API keys, no reverse
proxies — just the official web UI plus a secure read-only window into your
workspace.

**中文** — 如果你是 ChatGPT 付费用户（Plus/Pro），网页端强模型的额度往往
大量闲置；而另一边，编码 Agent 却在用按 token 计费、额度紧张的 API/Codex
模型干最烧脑的活：理解代码库、制定方案、审查实现。

这个项目就是来解决这种错配的：把最贵的"脑力活"（分析、规划、Review）卸载
到**你已经付过费的 ChatGPT 网页版**上，让 Codex 专注于它最擅长的执行——改
文件、跑命令、跑测试、提交。你的 API/Codex 额度几乎全部花在"干活"而不是
"思考"上。不需要 API Key，不搞逆向代理——用的就是官方网页，再加一条安全的
只读通道让 ChatGPT 看得到你的工作区。

## What it is · 这是什么

**EN** — Use the ChatGPT web app as the planning and review brain for your
Codex coding sessions, while Codex keeps full ownership of execution. Your
repository is never uploaded: ChatGPT reads exactly the lines it needs through
a secure, OAuth-protected, **read-only** MCP connection to your current
workspace.

**中文** — 把 ChatGPT 网页版变成 Codex 编码会话的"规划与审查大脑"，执行权
完全保留在 Codex 手里。你的仓库永远不会被上传：ChatGPT 通过一条安全的、
OAuth 保护的**只读** MCP 连接，按需读取当前工作区里它真正需要的那几行代码。

Detailed docs below are in English · 详细中文文档见 **[README.zh-CN.md](README.zh-CN.md)**

## One-paste install · 一段话安装

**EN** — Don't know git, Node, or terminals? You don't need to. Copy the
paragraph below, paste it to your coding agent (Codex), and go grab a coffee:

```text
Please install and configure "Codex with ChatGPT" for me, fully automatically.
I am a non-technical user — do everything yourself:

1. Check the environment: git and Node.js >= 20 must be available. Install
   anything missing yourself (macOS: Homebrew, Windows: winget). Also install
   cloudflared.
2. Download: clone https://github.com/XiaoDuoYa/codex-with-chatgpt into
   ~/codex-with-chatgpt (if it already exists, git pull to update).
3. Build: inside that folder run `corepack pnpm install` then `corepack pnpm build`.
4. Install the Skill: copy skill/SKILL.md to
   ~/.codex/skills/codex-with-chatgpt/SKILL.md, and update the line
   "The codex-with-chatgpt checkout lives at:" to the actual clone path.
5. First-time setup: follow the SKILL.md "first-time setup" workflow
   (run c2c setup, configure the ChatGPT connector in the BUILT-IN browser,
   enter the pairing code). Never open a third-party browser.
6. Only interrupt me for logins (ChatGPT / Cloudflare), CAPTCHAs or 2FA —
   and give me exactly ONE action at a time.
7. When done, show me the ✓ checklist and confirm the file-read test passed.
   I don't know what MCP, OAuth, tunnels or ports are. Don't explain them.
   If anything breaks, fix it yourself first.
```

**中文** — 不懂 git、Node、终端？完全不需要懂。把下面这段话原样复制给你的
编码 Agent（Codex），然后去倒杯咖啡：

```text
请帮我完整安装并配置 Codex with ChatGPT，全程自动，我是不懂技术的小白，
所有事情你自己做：

1. 环境自检：需要 git 和 Node.js ≥ 20，缺什么就自动安装
  （macOS 用 Homebrew，Windows 用 winget），同时安装 cloudflared。
2. 下载：把 https://github.com/XiaoDuoYa/codex-with-chatgpt 克隆到
   ~/codex-with-chatgpt（已存在就 git pull 更新）。
3. 构建：在该目录里执行 corepack pnpm install 和 corepack pnpm build。
4. 安装 Skill：把仓库里的 skill/SKILL.md 复制到
   ~/.codex/skills/codex-with-chatgpt/SKILL.md，并把文件中
   "The codex-with-chatgpt checkout lives at:" 那一行的路径改成实际克隆路径。
5. 首次配置：按 SKILL.md 里的 first-time setup 流程执行
  （运行 c2c setup，用内置浏览器打开 ChatGPT 配置连接器并输入配对码）。
   全程只用内置浏览器，禁止打开任何第三方浏览器。
6. 只有遇到需要我登录（ChatGPT / Cloudflare）、验证码或两步验证时才叫我，
   而且一次只告诉我一个动作。
7. 完成后给我看 ✓ 清单，并确认文件读取测试通过。我不懂 MCP、OAuth、
   Tunnel、端口这些词，不要向我解释；出了问题先自己修。
```

---

*The sections below are in English. 以下详细内容为英文，中文完整版见
[README.zh-CN.md](README.zh-CN.md)。*

## Install → Setup → Use (manual)

1. Install the Codex Skill: copy `skill/` to `~/.codex/skills/codex-with-chatgpt/`.
2. Tell Codex: **"Set up Codex with ChatGPT."** (中文: "使用 Codex with ChatGPT 完成首次配置。")
3. Use Codex normally: **"Use Codex with ChatGPT to implement XXX."**

That's the whole manual. You don't need to know what MCP, OAuth, tunnels,
ports or localhost are — Codex configures everything automatically and you
just see:

```
Codex with ChatGPT

✓ Project detected
✓ Workspace Bridge started
✓ Secure connection established
✓ ChatGPT connected
✓ File read test passed

Ready.
```

The only step that may need you: logging into ChatGPT (and nothing else).

## How it works

```
             ┌───────────────────────────┐
             │       ChatGPT Web         │
             │  Reason / Plan / Review   │
             └──────────┬──────────▲─────┘
                        │          │
               MCP      │          │ Computer Use
            Data Plane  │          │ Control Plane (<1 KB messages)
                        ▼          │
             ┌─────────────────────┐
             │      C2C Bridge     │   loopback-only HTTP server
             │  read-only MCP      │   OAuth 2.1 + one-time pairing code
             │  OAuth + Pairing    │   Cloudflare Quick Tunnel
             │  Tunnel Manager     │
             └──────────┬──────────┘
                        │  read-only
                        ▼
             ┌─────────────────────┐          ┌─────────────────────┐
             │   Local Workspace   │◀─────────│    Codex Harness    │
             └─────────────────────┘ edit/git │ shell / tests / fix │
                                              └─────────────────────┘
```

- **Control plane (Computer Use)**: Codex and ChatGPT exchange tiny structured
  `[C2C]` state messages — `INIT → PLAN → EXECUTED → REVIEW → DONE`. No diffs,
  no logs, no file bodies are ever pasted.
- **Data plane (MCP)**: ChatGPT pulls what it needs itself through 8 read-only
  tools: `workspace_info`, `list_directory`, `read_file`, `search_workspace`,
  `git_status`, `git_diff`, `test_status`, `execution_summary`.
- **Independent review**: after Codex executes, ChatGPT inspects the actual
  git diff and test records through MCP — it never trusts "all tests passed"
  claims blindly.

## Security model (short version)

- **Read-only by construction**: write/delete/shell/commit tools simply do not
  exist on the server. No prompt injection can enable them.
- **One workspace = one boundary**: every token is bound to a single workspace;
  path containment uses canonical realpaths (symlink/`../`/absolute-path escapes
  are all blocked and tested).
- **Sensitive files never leave**: `.env*`, keys, SSH, credentials are denied by
  default (`.env.example` allowed); `.c2cignore` adds your own rules.
- **Knowing the URL grants nothing**: the public MCP endpoint requires OAuth 2.1
  (PKCE S256, dynamic client registration, rotating refresh tokens). Without a
  token: 401. Wrong workspace: 403.
- **The model never sees long-lived credentials**: the only secret that ever
  touches a browser is a one-time pairing code (5-minute TTL, 5 attempts,
  rate-limited, destroyed on use).

Full threat model: [docs/security.md](docs/security.md)

## For developers

```bash
pnpm install
pnpm build          # -> dist/, exposes the `c2c` bin
pnpm test           # vitest: 76 tests (path security, OAuth, pairing, MCP e2e)

c2c setup           # bridge + tunnel + pairing code, all in one
c2c status / doctor / pair / unpair / logs / stop
```

Requirements: Node.js >= 20, git. `cloudflared` for the public connection
(auto-detected; the Skill installs it for you).

Docs: [architecture](docs/architecture.md) · [protocol](docs/protocol.md) ·
[security](docs/security.md) · [troubleshooting](docs/troubleshooting.md)

## Project layout

```
src/
  bridge/     loopback HTTP server, port recovery, admin API
  mcp/        8 read-only tools, stateless Streamable HTTP
  auth/       OAuth 2.1 (PKCE, DCR, refresh rotation, revocation)
  pairing/    one-time pairing codes (CSPRNG, TTL, rate limits)
  workspace/  path containment, sensitive-file policy, search, git
  tunnel/     TunnelProvider abstraction + Cloudflare Quick Tunnel
  execution/  execution records for the review loop
  process/    daemon lifecycle
  cli/        the c2c CLI
skill/        the Codex Skill (the real UX layer)
tests/        unit + integration tests
docs/         architecture / protocol / security / troubleshooting
```

## Status & disclaimer

V1. Verified end-to-end: bridge, OAuth + pairing, public tunnel, ChatGPT
connector setup, zero-touch first-run experience.

**Unofficial community project. Not affiliated with or endorsed by OpenAI.**

## License

[MIT](LICENSE)
