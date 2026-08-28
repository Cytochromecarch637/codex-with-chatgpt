# Codex with ChatGPT

ChatGPT thinks.
Codex works.

Use ChatGPT as the planning brain while keeping the Codex harness.

## Install → Setup → Use

1. Install the Codex Skill (`skill/SKILL.md`).
2. Say **"使用 Codex with ChatGPT 完成首次配置。"**
3. Use Codex normally: **"使用 Codex with ChatGPT，帮我实现 XXX。"**

That's it. You don't need to know what MCP, OAuth, tunnels or ports are —
Codex handles all of it and you'll just see:

```
Codex with ChatGPT

✓ 当前项目已识别
✓ Workspace Bridge 已启动
✓ 安全连接已建立
✓ ChatGPT 已连接
✓ 文件读取测试通过

Ready.
```

---

## What it does

- ChatGPT gets **read-only** visibility into your current workspace
  (files, search, git status/diff, execution summaries) through a secure,
  OAuth-protected MCP connection.
- Codex keeps full ownership of execution: editing, shell, tests, git.
- The two collaborate in a small structured loop:
  Plan (ChatGPT) → Execute (Codex) → Independent Review via MCP (ChatGPT) → Done.
- Your repository is never uploaded. ChatGPT pulls only the lines it needs.

## What it never does

- No write/delete/shell/commit tools for ChatGPT — they don't exist in V1.
- Never reads `.env`, keys, SSH, credentials (deny-by-default, plus `.c2cignore`).
- Never exposes anything outside the single connected workspace.
- Never lets the model touch long-lived tokens — only a one-time pairing code.

## For developers

```bash
pnpm install
pnpm build          # -> dist/, exposes the `c2c` bin
pnpm test           # vitest: 76 tests (path security, OAuth, pairing, MCP e2e)

c2c setup           # bridge + tunnel + pairing code
c2c status / doctor / pair / unpair / logs / stop
```

Requirements: Node.js >= 20, git; `cloudflared` for the public connection
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

## Status

Unofficial community project.
Not affiliated with or endorsed by OpenAI.

## License

MIT
