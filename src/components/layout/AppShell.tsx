"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Providers } from "../providers";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
}

function ShellContent({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--color-bg-app)",
        }}
        className="main-content"
      >
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: "24px", overflowX: "hidden" }}>{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <Providers>
      <ShellContent title={title}>{children}</ShellContent>
    </Providers>
  );
}
