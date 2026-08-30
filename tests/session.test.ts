import { afterEach, describe, expect, it } from "vitest";
import {
  clearChatPointer,
  mergeSession,
  normalizeProjectUrl,
  projectIdFromUrl,
  readSession,
  resolveConversation,
  writeSession,
} from "../src/session/state.js";
import { cleanup, makeTmpDir } from "./helpers.js";

const PROJECT = "https://chatgpt.com/g/g-p-6a94399430e08191860ab5364b7748b8/project";

describe("normalizeProjectUrl", () => {
  it("accepts the collection URL and strips extras", () => {
    expect(normalizeProjectUrl(`${PROJECT}/`)).toBe(PROJECT);
    expect(normalizeProjectUrl("https://www.chatgpt.com/g/g-p-abc123/project?foo=1")).toBe(
      "https://chatgpt.com/g/g-p-abc123/project"
    );
    expect(projectIdFromUrl(PROJECT)).toBe("g-p-6a94399430e08191860ab5364b7748b8");
  });

  it("rejects a normal chat URL or a guessed name", () => {
    expect(normalizeProjectUrl("https://chatgpt.com/c/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")).toBeNull();
    expect(normalizeProjectUrl("https://chatgpt.com/")).toBeNull();
    expect(normalizeProjectUrl("https://example.com/g/g-p-abc/project")).toBeNull();
  });
});

describe("resolveConversation", () => {
  it("treats a missing file as a new workspace (Project by default)", () => {
    const view = resolveConversation(null);
    expect(view.mode).toBe("project");
    expect(view.reason).toBe("new-workspace");
    expect(view.reuseSavedChat).toBe(false);
    expect(view.projectReady).toBe(false);
  });

  it("keeps a legacy session file on long-chat and does not migrate", () => {
    const view = resolveConversation({
      url: "https://chatgpt.com/c/old-chat",
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(view.mode).toBe("long-chat");
    expect(view.reason).toBe("existing-long-chat");
    expect(view.reuseSavedChat).toBe(true);
    expect(view.chatUrl).toBe("https://chatgpt.com/c/old-chat");
  });

  it("lets an explicit long-chat opt-out win over a leftover collection URL", () => {
    const view = resolveConversation({
      conversationMode: "long-chat",
      projectUrl: PROJECT,
      url: "https://chatgpt.com/c/keep",
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(view.mode).toBe("long-chat");
    expect(view.reuseSavedChat).toBe(true);
  });

  it("uses Project when a collection URL is stored", () => {
    const view = resolveConversation({
      conversationMode: "project",
      projectUrl: PROJECT,
      url: "https://chatgpt.com/c/thread-1",
      connectorName: "Codex with ChatGPT · Demo",
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(view.mode).toBe("project");
    expect(view.projectReady).toBe(true);
    expect(view.reuseSavedChat).toBe(false);
    expect(view.connectorName).toBe("Codex with ChatGPT · Demo");
  });
});

describe("mergeSession", () => {
  it("keeps Project fields when only the chat URL is updated", () => {
    const next = mergeSession(
      {
        conversationMode: "project",
        projectUrl: PROJECT,
        connectorName: "Codex with ChatGPT · Demo",
        url: "https://chatgpt.com/c/old",
        savedAt: "2026-01-01T00:00:00.000Z",
      },
      { url: "https://chatgpt.com/c/new", taskId: "c2c_ab12", iteration: 1 }
    );
    expect(next.projectUrl).toBe(PROJECT);
    expect(next.conversationMode).toBe("project");
    expect(next.url).toBe("https://chatgpt.com/c/new");
    expect(next.connectorName).toBe("Codex with ChatGPT · Demo");
    expect(next.taskId).toBe("c2c_ab12");
  });

  it("rejects a non-collection project URL", () => {
    expect(() =>
      mergeSession(null, {
        conversationMode: "project",
        projectUrl: "https://chatgpt.com/c/nope",
      })
    ).toThrow(/project URL/);
  });
});

describe("clearChatPointer", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) cleanup(dir);
    dirs.length = 0;
    delete process.env.C2C_STATE_DIR;
  });

  it("keeps the collection binding in Project mode", () => {
    const dir = makeTmpDir("session-clear");
    dirs.push(dir);
    process.env.C2C_STATE_DIR = dir;
    writeSession("abc123abc123", {
      conversationMode: "project",
      projectUrl: PROJECT,
      url: "https://chatgpt.com/c/gone",
      connectorName: "Codex with ChatGPT · Demo",
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(clearChatPointer("abc123abc123")).toEqual({ cleared: true, keptProject: true });
    const saved = readSession("abc123abc123");
    expect(saved?.projectUrl).toBe(PROJECT);
    expect(saved?.url).toBeUndefined();
  });

  it("deletes a legacy long-chat file", () => {
    const dir = makeTmpDir("session-clear-legacy");
    dirs.push(dir);
    process.env.C2C_STATE_DIR = dir;
    writeSession("def456def456", {
      url: "https://chatgpt.com/c/legacy",
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(clearChatPointer("def456def456")).toEqual({ cleared: true, keptProject: false });
    expect(readSession("def456def456")).toBeNull();
  });
});
