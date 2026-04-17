export type HistoryMode = "replace" | "push";

const SESSION_ROUTE_PREFIX = "/sessions/";

export function buildSessionPath(sessionId: string): string {
  return `${SESSION_ROUTE_PREFIX}${encodeURIComponent(sessionId)}`;
}

export function getSessionIdFromPath(
  pathname: string = window.location.pathname,
): string | null {
  if (!pathname.startsWith(SESSION_ROUTE_PREFIX)) {
    return null;
  }

  const encodedId = pathname.slice(SESSION_ROUTE_PREFIX.length);
  if (!encodedId || encodedId.includes("/")) {
    return null;
  }

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return null;
  }
}

export function updateSessionPath(
  sessionId: string | null | undefined,
  mode: HistoryMode = "replace",
): void {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = sessionId ? buildSessionPath(sessionId) : "/";
  if (window.location.pathname === targetPath) {
    return;
  }

  if (mode === "push") {
    window.history.pushState({}, "", targetPath);
    return;
  }

  window.history.replaceState({}, "", targetPath);
}
