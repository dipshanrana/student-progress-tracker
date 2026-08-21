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
            background: "rgba(0,0,0,0.5)",
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
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
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
            padding: "20px 16px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(79,70,229,0.25)",
                border: "1px solid rgba(79,70,229,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <GraduationCap size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: "14px", fontWeight: 700, lineHeight: 1.2 }}>
                SPTracker
              </div>
              <div style={{ color: "#475569", fontSize: "11px" }}>Student Progress</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              display: "none",
            }}
            className="lg:hidden block"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: isAdmin
                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                : "linear-gradient(135deg, #0ea5e9, #0284c7)",
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
                color: "#e2e8f0",
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
                color: isAdmin ? "#818cf8" : "#38bdf8",
                fontWeight: 600,
              }}
            >
              {isAdmin ? "Administrator" : "Viewer"}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px", overflow: "auto" }}>
          <p
            style={{
              color: "#334155",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  marginBottom: "2px",
                  color: isActive ? "#818cf8" : "#64748b",
                  background: isActive ? "rgba(79,70,229,0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #4f46e5" : "3px solid transparent",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p
                style={{
                  color: "#334155",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "16px 8px 8px",
                }}
              >
                Admin
              </p>
              <Link
                href="/settings"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  color: pathname === "/settings" ? "#818cf8" : "#64748b",
                  background: pathname === "/settings" ? "rgba(79,70,229,0.15)" : "transparent",
                  borderLeft: pathname === "/settings" ? "3px solid #4f46e5" : "3px solid transparent",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.15s ease",
                }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "8px",
              color: "#64748b",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#64748b";
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
