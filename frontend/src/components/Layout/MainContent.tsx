/**
 * Main Content Component
 * Main content area wrapper
 */

import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {children}
    </main>
  );
}
