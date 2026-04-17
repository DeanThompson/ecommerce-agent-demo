import { beforeEach, describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";
import {
  addMessageToSession,
  clearAllSessions,
  getOrCreateSession,
  listSessions,
} from "../../src/services/sessionStore.js";

describe("session list consistency", () => {
  beforeEach(() => {
    clearAllSessions();
  });

  it("returns consistent title and message count after optimized query", () => {
    const firstSession = getOrCreateSession();
    const secondSession = getOrCreateSession();

    addMessageToSession(firstSession.id, {
      id: uuidv4(),
      role: "user",
      content: "first user message for summary title",
      timestamp: new Date(),
    });

    addMessageToSession(firstSession.id, {
      id: uuidv4(),
      role: "assistant",
      content: "assistant answer",
      timestamp: new Date(),
    });

    addMessageToSession(secondSession.id, {
      id: uuidv4(),
      role: "assistant",
      content: "assistant only",
      timestamp: new Date(),
    });

    const sessions = listSessions();
    const firstSummary = sessions.find((session) => session.id === firstSession.id);
    const secondSummary = sessions.find((session) => session.id === secondSession.id);

    expect(firstSummary).toBeDefined();
    expect(firstSummary?.messageCount).toBe(2);
    expect(firstSummary?.title).toContain("first user message");

    expect(secondSummary).toBeDefined();
    expect(secondSummary?.messageCount).toBe(1);
    expect(secondSummary?.title).toBe("新对话");
  });
});
