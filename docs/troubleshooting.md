# Troubleshooting

First move, always:

```
c2c doctor
```

It checks Node, workspace, bridge, MCP, OAuth and tunnel — and repairs what it
can (restarts the bridge, restarts the tunnel) without asking.

## Common situations

### "Bridge 未运行"
`c2c start` (or let doctor do it). Bridge logs:
`c2c logs`, or verbose: `c2c logs --verbose`.

### Tunnel URL unreachable / ChatGPT says the connector is broken
Quick Tunnel URLs change whenever the tunnel restarts.

1. `c2c doctor` — restarts the tunnel and prints the current URL.
2. Update the connector's Server URL in ChatGPT settings (the Skill does this
   automatically via Computer Use).
3. Re-authorize with a fresh pairing code: `c2c pair`.

### "配对码无效/过期"
Pairing codes are one-time and expire after ~5 minutes:

```
c2c pair
```

generates a fresh one (older codes become invalid immediately).

### ChatGPT gets 401 on every tool call
The access token expired and refresh failed (e.g. after `c2c unpair` or a
long offline period). Reconnect the connector in ChatGPT (it will run OAuth
again) and enter a fresh pairing code.

### cloudflared is not installed
macOS: `brew install cloudflared`
Windows: `winget install Cloudflare.cloudflared`
Linux: see Cloudflare's package instructions.
The Skill installs this automatically during setup.

### Port already in use
Handled automatically: an existing healthy bridge for the same workspace is
reused; anything else makes the bridge pick a free port. Configuration follows
automatically.

### Reading a file returns ACCESS_DENIED_SENSITIVE_FILE
Working as intended: `.env`, keys, credentials and anything matched by
`.c2cignore` are never readable through ChatGPT. `.env.example` is allowed.

### Completely stuck
```
c2c stop
c2c setup
```

re-creates the bridge, tunnel and pairing session from scratch. Existing
authorizations stay valid unless you also ran `c2c unpair`.
