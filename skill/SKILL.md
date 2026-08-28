---
name: codex-with-chatgpt
description: >
  Use ChatGPT (web) as the planning and review brain for Codex coding sessions,
  while Codex keeps full execution ownership. Use when the user says
  "使用 Codex with ChatGPT ..." / "Set up Codex with ChatGPT" / "用 ChatGPT 规划",
  when they ask to connect ChatGPT to the current workspace, disconnect it,
  or run a task through the ChatGPT planning loop.
---

# Codex with ChatGPT

ChatGPT thinks. Codex works.

You (Codex) own execution: editing, shell, git, tests, recovery.
ChatGPT owns high-level reasoning: understanding, planning, review, debug strategy.
The C2C Bridge gives ChatGPT read-only MCP access to the current workspace, so
control messages between you and ChatGPT stay tiny (< 1 KB) — ChatGPT pulls
whatever data it needs by itself.

**Golden rules**

1. NEVER paste file contents, diffs, or logs into ChatGPT. ChatGPT reads them through MCP.
2. NEVER show the user technical internals (MCP, OAuth, PKCE, tunnel, ports, localhost).
   Speak in terms of "连接 ChatGPT / 安全连接 / 配对".
3. The pairing code is the ONLY credential you may ever type into a browser.
   Never touch OAuth tokens, cookies, or session storage.
4. If something fails, run `c2c doctor` and repair silently. Only involve the user
   for logins, CAPTCHA, 2FA, or explicit consent screens — and then give them ONE action.

## Locations

- CLI: run `node <repo>/bin/c2c.js <command>` from the codex-with-chatgpt checkout,
  or `c2c <command>` if globally linked. All commands support `--json` for parsing.
- Always pass `-w <workspace root>` (the project the user is working on, NOT the c2c repo).

## Workflow: first-time setup（"使用 Codex with ChatGPT 完成首次配置"）

1. Detect prerequisites yourself: `node --version` (>= 20), and check `cloudflared`.
   - If cloudflared is missing on macOS run `brew install cloudflared`; on Windows use
     `winget install Cloudflare.cloudflared`. Do this yourself; don't ask.
2. If the c2c repo has no `node_modules`, run `pnpm install && pnpm build` in it.
3. Run: `c2c setup -w <workspace> --json`
   → returns `{ mcpUrl, pairingCode, workspaceName, ... }`.
   Pairing codes expire in ~5 minutes: run `c2c pair --json` for a fresh one if you're slow.
4. Open ChatGPT in the browser (chatgpt.com). Using Computer Use:
   a. Go to Settings → Connectors / Apps (developer mode may need to be enabled
      under Settings → Apps & Connectors → Advanced).
   b. Create a new connector:
      - Name: `Codex with ChatGPT`
      - Description: `Securely connect ChatGPT to the current Codex workspace for planning and review.`
      - Server URL: the `mcpUrl` from step 3
      - Authentication: OAuth
   c. Click Connect / Authorize. An authorization page opens asking for a pairing code.
   d. Type the pairing code from step 3. Submit.
   e. Wait for ChatGPT to finish scanning tools (should list 8 read-only tools).
5. Verify: open a new ChatGPT chat, send:
   `Use the "Codex with ChatGPT" connector: call workspace_info and read hello-style top-level file. Reply with the workspace name.`
   Confirm the reply matches `workspaceName`.
6. Report to the user exactly in this shape (no internals):

```
Codex with ChatGPT

✓ 当前项目已识别
✓ Workspace Bridge 已启动
✓ 安全连接已建立
✓ ChatGPT 已连接
✓ 文件读取测试通过

Ready.
```

If a login wall appears (ChatGPT, Cloudflare): stop, tell the user the ONE thing
to do ("请登录 ChatGPT，完成后告诉我'好了'"), then continue.

## Workflow: coding task（"使用 Codex with ChatGPT 完成 XXX"）

Protocol states: INIT → PLAN → EXECUTING → EXECUTED → REVIEW → (PLAN | DONE | BLOCKED).
All control messages start with `[C2C]`. Keep them under 1 KB. Docs: `docs/protocol.md`.

0. Ensure the bridge is healthy: `c2c doctor -w <workspace> --json` (auto-repairs).
   Generate task id: `c2c_` + 4 random hex chars.
1. Open (or reuse) the C2C conversation in ChatGPT. On a NEW conversation first send
   the boot prompt from `docs/protocol.md` §Boot Prompt.
2. Send INIT with the user's goal:

```
[C2C]
STATE: INIT
TASK_ID: c2c_f81a
ITERATION: 0

GOAL:
<user's goal, one paragraph>

INSTRUCTION:
Inspect the connected workspace through the Codex with ChatGPT MCP connector.
Produce a C2C PLAN message.
```

3. Wait for ChatGPT's `STATE: PLAN` reply. Read GOAL/ACTIONS/TESTS/SUCCESS_CRITERIA.
4. Execute the plan yourself with your own harness (your tools, your judgment;
   ChatGPT does not micro-manage tool calls).
5. Record the execution so ChatGPT can read it via MCP:
   `c2c record -w <ws> --task c2c_f81a --iteration 1 --changed-files "src/a.ts,src/b.ts" --tests "27 passed" --exit-status ok`
6. Send EXECUTED (no diffs, no logs):

```
[C2C]
STATE: EXECUTED
TASK_ID: c2c_f81a
ITERATION: 1

RESULT:
Execution finished.

CHANGED_FILES:
4

TESTS:
27 passed

Please independently inspect the workspace and current git diff through MCP.
```

7. ChatGPT reviews via MCP (git_diff, read_file, test_status) and replies
   DONE / PLAN (next iteration) / BLOCKED.
8. Loop. Respect maxIterations (`.c2c.json`, default 12). At the limit, pause and ask
   the user: "已完成 12 轮协作，仍有未解决问题，是否继续？"
9. On DONE: summarize the result to the user in plain language.
10. On BLOCKED: read ChatGPT's reason, fix what you can, or surface the single
    decision the user must make.

## Workflow: disconnect（"断开 ChatGPT"）

1. `c2c unpair -w <workspace>` (revokes all tokens immediately).
2. Optionally remove the connector in ChatGPT settings via Computer Use.
3. Tell the user: "已断开 ChatGPT 对该项目的访问。"

## Workflow: repair（anything looks broken）

1. `c2c doctor -w <workspace> --json` — it restarts the bridge and tunnel itself.
2. If the tunnel URL changed (quick tunnels change on restart), update the
   connector's Server URL in ChatGPT settings via Computer Use, then re-pair:
   `c2c pair --json` → enter the new pairing code on the authorization page.
3. If the ChatGPT conversation was lost, start a new one: boot prompt → task summary
   → current state. No file re-uploading is ever needed (the workspace lives in MCP).

## Recovery map

| Symptom | Action |
| --- | --- |
| Bridge not running | `c2c start` (doctor does this automatically) |
| Tunnel dead / URL unreachable | `c2c doctor` → it restarts; then update connector URL if changed |
| ChatGPT says tool call failed / 401 | token expired or revoked → re-pair (new pairing code + authorize) |
| Pairing code rejected/expired | `c2c pair --json` for a fresh code |
| Port conflict | handled automatically; never surface to the user |
| cloudflared missing | install it yourself (brew/winget), then retry |
