"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader2, Users, BookOpen, BarChart3, Shield } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin Demo", email: "admin@school.com", password: "admin123", color: "#6d28d9", bg: "rgba(109,40,217,0.1)", border: "rgba(109,40,217,0.25)", role: "Full access" },
  { label: "Viewer Demo", email: "viewer@school.com", password: "viewer123", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)", border: "rgba(14,165,233,0.25)", role: "Read only" },
];

const FEATURES = [
  { icon: Users, text: "Student management & profiles" },
  { icon: BookOpen, text: "Homework & assignment tracking" },
  { icon: BarChart3, text: "Performance analytics & reports" },
  { icon: Shield, text: "Role-based access control" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (result?.error) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Unable to connect. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("A network error occurred. Please check your connection.");
    }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", color: "white", fontSize: "15px", outline: "none",
    transition: "all 0.2s", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0c0c14" }}>
      {/* Left panel — branding */}
      <div style={{
        display: "none", flex: 1, flexDirection: "column", justifyContent: "center", padding: "60px",
        background: "linear-gradient(160deg, #1a0a3d 0%, #0c0c14 60%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }} className="login-left-panel">
        <div style={{ maxWidth: "420px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(109,40,217,0.25)", border: "1px solid rgba(109,40,217,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={26} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>SPTracker</div>
              <div style={{ color: "#6b7280", fontSize: "12px" }}>Student Progress Tracker</div>
            </div>
          </div>

          <h1 style={{ color: "white", fontSize: "36px", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px" }}>
            Track student progress<br />
            <span style={{ color: "#8b5cf6" }}>with confidence</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "16px", lineHeight: 1.7, marginBottom: "48px" }}>
            A comprehensive platform for schools to monitor academic performance, homework completion, and student growth.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color="#8b5cf6" />
                </div>
                <span style={{ color: "#d1d5db", fontSize: "14px" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        background: "linear-gradient(160deg, #12091f 0%, #0c0c14 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* BG glow blobs */}
        <div style={{ position: "absolute", top: "-200px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-200px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
          {/* Mobile-only logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }} className="mobile-logo">
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "16px", background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.4)", marginBottom: "14px" }}>
              <GraduationCap size={30} color="#8b5cf6" />
            </div>
            <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Student Progress Tracker</h1>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Sign in to access your dashboard</p>
          </div>

          {/* Card */}
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
            <h2 style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>Welcome back</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>Sign in to your account to continue</p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "12px 14px", marginBottom: "20px", color: "#fca5a5", fontSize: "14px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ flexShrink: 0, marginTop: "1px" }}>&#9888;</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#9ca3af", fontSize: "12px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</label>
                <input
                  type="email" id="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com" required style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(109,40,217,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(109,40,217,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "#9ca3af", fontSize: "12px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} id="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(109,40,217,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(109,40,217,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign in button */}
              <button type="submit" id="sign-in-btn" disabled={loading} style={{
                width: "100%", padding: "13px",
                background: loading ? "#4c1d95" : "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
                color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s", boxShadow: "0 4px 12px rgba(109,40,217,0.4)",
              }}>
                {loading ? (<><Loader2 size={18} className="animate-spin" /> Signing in...</>) : "Sign In"}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                <span style={{ color: "#4b5563", fontSize: "12px", whiteSpace: "nowrap" }}>Try a demo account</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button key={acc.label} type="button" onClick={() => fillDemo(acc)}
                    style={{
                      padding: "10px 12px", background: acc.bg, border: `1px solid ${acc.border}`,
                      borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = acc.bg.replace("0.1", "0.18"); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = acc.bg; }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, color: acc.color }}>{acc.label}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "1px" }}>{acc.role}</div>
                  </button>
                ))}
              </div>
              <p style={{ color: "#4b5563", fontSize: "11px", textAlign: "center", marginTop: "10px" }}>
                Click a demo button to autofill credentials, then click Sign In
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
