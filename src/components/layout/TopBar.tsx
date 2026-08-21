"use client";

import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 30,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            borderRadius: "6px",
          }}
          className="lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            position: "relative",
            padding: "6px",
            borderRadius: "8px",
          }}
        >
          <Bell size={20} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 12px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: isAdmin
                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
              {session?.user?.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: isAdmin ? "#4f46e5" : "#0ea5e9",
                fontWeight: 600,
              }}
            >
              {isAdmin ? "Admin" : "Viewer"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
