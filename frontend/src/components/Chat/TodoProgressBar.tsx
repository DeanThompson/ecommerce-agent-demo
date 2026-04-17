/**
 * Todo Progress Bar Component
 * Displays task progress above the chat area (like Claude Code)
 */

import {
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { TodoItem } from "../../types";

interface TodoProgressBarProps {
  todos: TodoItem[];
}

export function TodoProgressBar({ todos }: TodoProgressBarProps) {
  if (todos.length === 0) return null;

  const completed = todos.filter((t) => t.status === "completed").length;
  const inProgress = todos.find((t) => t.status === "in_progress");
  const total = todos.length;
  const progress = (completed / total) * 100;

  return (
    <div
      style={{
        padding: "12px 16px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "4px",
            background: "var(--border-color)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--accent-color)",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}
        >
          {completed}/{total}
        </span>
      </div>

      {/* Current task */}
      {inProgress && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "var(--text-primary)",
          }}
        >
          <LoadingOutlined spin style={{ color: "var(--accent-color)" }} />
          <span>{inProgress.activeForm}</span>
        </div>
      )}

      {/* Task list */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "8px",
        }}
      >
        {todos.map((todo, index) => (
          <span
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              background:
                todo.status === "completed"
                  ? "rgba(22, 163, 74, 0.1)"
                  : todo.status === "in_progress"
                    ? "rgba(217, 119, 87, 0.1)"
                    : "rgba(156, 163, 175, 0.1)",
              color:
                todo.status === "completed"
                  ? "#16a34a"
                  : todo.status === "in_progress"
                    ? "var(--accent-color)"
                    : "var(--text-secondary)",
            }}
          >
            {todo.status === "completed" ? (
              <CheckCircleOutlined style={{ fontSize: "10px" }} />
            ) : todo.status === "in_progress" ? (
              <LoadingOutlined spin style={{ fontSize: "10px" }} />
            ) : (
              <ClockCircleOutlined style={{ fontSize: "10px" }} />
            )}
            <span
              style={{
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {todo.content}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
