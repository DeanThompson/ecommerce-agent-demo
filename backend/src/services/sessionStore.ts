/**
 * Session Store Service
 * File-based session persistence using JSONL + index metadata
 */

import { v4 as uuidv4 } from "uuid";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync, appendFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import type { Session, Message, SessionSummary } from "../types/index.js";

interface SessionIndexEntry {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  agentSessionId?: string;
}

interface SessionIndexData {
  version: number;
  sessions: SessionIndexEntry[];
}

interface PersistedMessage extends Omit<Message, "timestamp"> {
  timestamp: string;
}

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(__dirname, "..", "..", "..");
const sessionsDir =
  process.env.SESSIONS_DIR?.trim() ||
  join(projectRoot, "data", "sessions");
const indexPath = join(sessionsDir, "index.json");

let indexCache: Map<string, SessionIndexEntry> | null = null;

function ensureStore(): void {
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }

  if (!existsSync(indexPath)) {
    const initial: SessionIndexData = { version: 1, sessions: [] };
    writeFileSync(indexPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function loadIndex(): Map<string, SessionIndexEntry> {
  if (indexCache) {
    return indexCache;
  }

  ensureStore();
  try {
    const raw = readFileSync(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as SessionIndexData;
    const map = new Map<string, SessionIndexEntry>();
    for (const session of parsed.sessions || []) {
      map.set(session.id, session);
    }
    indexCache = map;
  } catch {
    indexCache = new Map<string, SessionIndexEntry>();
  }

  return indexCache;
}

function saveIndex(index: Map<string, SessionIndexEntry>): void {
  ensureStore();
  const sessions = Array.from(index.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const payload: SessionIndexData = {
    version: 1,
    sessions,
  };
  writeFileSync(indexPath, JSON.stringify(payload, null, 2), "utf-8");
}

function getSessionFilePath(sessionId: string): string {
  return join(sessionsDir, `${sessionId}.jsonl`);
}

function truncateTitle(text: string): string {
  return text.slice(0, 50) + (text.length > 50 ? "..." : "");
}

function readSessionMessages(sessionId: string): Message[] {
  const sessionFile = getSessionFilePath(sessionId);
  if (!existsSync(sessionFile)) {
    return [];
  }

  const raw = readFileSync(sessionFile, "utf-8");
  if (!raw.trim()) {
    return [];
  }

  const messages: Message[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;

    try {
      const parsed = JSON.parse(line) as PersistedMessage;
      messages.push({
        ...parsed,
        timestamp: new Date(parsed.timestamp),
      });
    } catch {
      // Ignore malformed lines to keep service available
    }
  }
  return messages;
}

function persistMessage(sessionId: string, message: Message): void {
  const sessionFile = getSessionFilePath(sessionId);
  const serialized: PersistedMessage = {
    ...message,
    timestamp: message.timestamp.toISOString(),
  };
  appendFileSync(sessionFile, `${JSON.stringify(serialized)}\n`, "utf-8");
}

export function getSession(sessionId: string): Session | undefined {
  const index = loadIndex();
  const meta = index.get(sessionId);
  if (!meta) return undefined;

  return {
    id: meta.id,
    agentSessionId: meta.agentSessionId,
    messages: readSessionMessages(sessionId),
    createdAt: new Date(meta.createdAt),
    updatedAt: new Date(meta.updatedAt),
  };
}

export function getOrCreateSession(sessionId?: string): Session {
  const index = loadIndex();
  const existingId = sessionId && index.has(sessionId) ? sessionId : undefined;
  if (existingId) {
    const existing = getSession(existingId);
    if (existing) return existing;
  }

  const id = sessionId || uuidv4();
  const now = new Date().toISOString();
  const entry: SessionIndexEntry = {
    id,
    title: "新对话",
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  index.set(id, entry);
  saveIndex(index);

  const sessionFile = getSessionFilePath(id);
  if (!existsSync(sessionFile)) {
    writeFileSync(sessionFile, "", "utf-8");
  }

  return {
    id,
    messages: [],
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function addMessageToSession(sessionId: string, message: Message): void {
  const index = loadIndex();
  let entry = index.get(sessionId);

  if (!entry) {
    const now = new Date().toISOString();
    entry = {
      id: sessionId,
      title: "新对话",
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    index.set(sessionId, entry);
  }

  persistMessage(sessionId, message);

  const now = new Date().toISOString();
  entry.messageCount += 1;
  entry.updatedAt = now;
  if (message.role === "user" && entry.title === "新对话") {
    entry.title = truncateTitle(message.content);
  }

  saveIndex(index);
}

export function updateSession(
  sessionId: string,
  updates: Partial<Session>,
): void {
  const index = loadIndex();
  const entry = index.get(sessionId);
  if (!entry) return;

  if (updates.updatedAt) {
    entry.updatedAt = updates.updatedAt.toISOString();
  } else {
    entry.updatedAt = new Date().toISOString();
  }

  if (updates.agentSessionId) {
    entry.agentSessionId = updates.agentSessionId;
  }

  saveIndex(index);
}

export function deleteSession(sessionId: string): boolean {
  const index = loadIndex();
  if (!index.has(sessionId)) return false;

  index.delete(sessionId);
  saveIndex(index);

  const sessionFile = getSessionFilePath(sessionId);
  if (existsSync(sessionFile)) {
    unlinkSync(sessionFile);
  }
  return true;
}

export function listSessions(): SessionSummary[] {
  const index = loadIndex();
  return Array.from(index.values())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      messageCount: entry.messageCount,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    }));
}

export function clearAllSessions(): void {
  const index = loadIndex();
  const ids = Array.from(index.keys());
  index.clear();
  saveIndex(index);

  for (const id of ids) {
    const sessionFile = getSessionFilePath(id);
    if (existsSync(sessionFile)) {
      unlinkSync(sessionFile);
    }
  }
}
