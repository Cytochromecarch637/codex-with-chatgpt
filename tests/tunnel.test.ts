import { describe, it, expect } from "vitest";
import { parseQuickTunnelUrl } from "../src/tunnel/cloudflared.js";

describe("parseQuickTunnelUrl", () => {
  it("extracts the URL from cloudflared banner output", () => {
    const line =
      "2026-08-28T10:00:00Z INF |  https://random-words-here-1234.trycloudflare.com                              |";
    expect(parseQuickTunnelUrl(line)).toBe("https://random-words-here-1234.trycloudflare.com");
  });

  it("ignores unrelated lines", () => {
    expect(parseQuickTunnelUrl("INF Starting tunnel connection")).toBeNull();
    expect(parseQuickTunnelUrl("visit https://www.cloudflare.com for docs")).toBeNull();
  });

  it("does not match non-trycloudflare hosts", () => {
    expect(parseQuickTunnelUrl("https://evil.example.com/trycloudflare.com")).toBeNull();
  });
});
