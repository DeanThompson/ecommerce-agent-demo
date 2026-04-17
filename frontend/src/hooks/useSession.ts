/**
 * Session Hook
 * Session management logic
 */

import { useState, useCallback, useEffect } from "react";
import type { SessionSummary, SessionResponse } from "../types";

const API_BASE = "/api";

export function useSession() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single session
  const fetchSession = useCallback(
    async (sessionId: string): Promise<SessionResponse | null> => {
      try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to fetch session");
        }
        return await response.json();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch session",
        );
        return null;
      }
    },
    [],
  );

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
          method: "DELETE",
        });
        if (response.ok || response.status === 204) {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete session",
        );
        return false;
      }
    },
    [],
  );

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    fetchSession,
    deleteSession,
  };
}
