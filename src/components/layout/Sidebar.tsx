"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  LogOut,
  GraduationCap,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/homework", label: "Homework", icon: BookOpen },
  { href: "/tests", label: "Tests", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

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
          background: "#0f172a",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
        className="lg:translate-x-0"
      >
        {/* Logo */}
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
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                flexShrink: 0,
              }}
            >
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                EduTracker
              </div>
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 500 }}>Student Portal</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
            }}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
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
              {session?.user?.name}
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

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <p
            style={{
              color: "#475569",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                style={{
                  marginBottom: "4px",
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} opacity={0.7} />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p
                style={{
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "16px 8px 8px",
                }}
              >
                Management
              </p>
              <Link
                href="/settings"
                onClick={onClose}
                className={`sidebar-link ${pathname === "/settings" ? "active" : ""}`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
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
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
