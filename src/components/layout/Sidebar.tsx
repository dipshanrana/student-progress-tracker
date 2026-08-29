"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  GraduationCap,
  Settings,
  UserCheck,
} from "lucide-react";

interface NavGroup {
  group: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    adminOnly?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    group: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Students",
    items: [
      { href: "/students", label: "Students", icon: Users },
      { href: "/homework", label: "Attendance / HW", icon: UserCheck },
      { href: "/tests", label: "Assessments", icon: ClipboardList },
    ],
  },
  {
    group: "Analytics",
    items: [
      { href: "/reports", label: "Performance & Reports", icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  // While session is loading, default to showing admin links if session object hasn't loaded yet to prevent sidebar layout flash/flicker
  const isAdmin = status === "loading" || session?.user?.role === "ADMIN";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 40,
          }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "240px",
          background: "#0b1329",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "transform 0.25s ease",
        }}
        className={`sidebar-aside ${open ? "sidebar-open" : ""}`}
      >
        {/* Header Branding */}
        <div
          style={{
            padding: "20px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                flexShrink: 0,
              }}
            >
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                Student Progress
              </div>
              <div style={{ color: "#475569", fontSize: "11px", fontWeight: 500 }}>Tracker</div>
            </div>
          </div>
        </div>

        {/* User Badge */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: isAdmin ? "#2563eb" : "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "13px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {session?.user?.name ?? "User"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: isAdmin ? "#60a5fa" : "#38bdf8",
                fontWeight: 500,
              }}
            >
              {isAdmin ? "Administrator" : "Viewer"}
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: "16px" }}>
              {group.group && (
                <p
                  style={{
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "0 10px",
                    marginBottom: "6px",
                  }}
                >
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                    style={{ marginBottom: "2px" }}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          {isAdmin && (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "0 10px",
                  marginBottom: "6px",
                }}
              >
                System
              </p>
              <Link
                href="/settings"
                onClick={onClose}
                className={`sidebar-link ${pathname === "/settings" || pathname.startsWith("/settings/") ? "active" : ""}`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="sidebar-link"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#94a3b8",
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
