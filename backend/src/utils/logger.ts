/**
 * Logger Utility
 * Structured logging for agent interactions
 */

import type { LogCategory, LogEntry, LogLevel } from "../types/index.js";

const normalizeValue = (value: unknown) => {
  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack,
      name: value.name,
    };
  }
  return value;
};

const normalizeMeta = (meta?: Record<string, unknown>) => {
  if (!meta) return {};
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, normalizeValue(value)]),
  );
};

const emit = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  meta?: Record<string, unknown>,
) => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    meta: Object.keys(meta ?? {}).length > 0 ? normalizeMeta(meta) : undefined,
  };

  const payload = JSON.stringify(entry);
  if (level === "ERROR") {
    console.error(payload);
  } else if (level === "WARN") {
    console.warn(payload);
  } else {
    console.log(payload);
  }
};

export const logger = {
  info: (
    category: LogCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => emit("INFO", category, message, meta),
  error: (
    category: LogCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => emit("ERROR", category, message, meta),
  debug: (
    category: LogCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => emit("DEBUG", category, message, meta),
  warn: (
    category: LogCategory,
    message: string,
    meta?: Record<string, unknown>,
  ) => emit("WARN", category, message, meta),
};
