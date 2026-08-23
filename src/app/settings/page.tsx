import { AppShell } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/permissions";

export const metadata = {
  title: "Settings | Student Progress Tracker",
};

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <AppShell title="Settings">
      <div className="card" style={{ padding: "24px", maxWidth: "600px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "8px" }}>Admin Settings</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
          Manage application settings and configurations.
        </p>
        <div style={{ padding: "16px", background: "var(--color-bg-app)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
          <p style={{ color: "#374151", fontSize: "14px" }}>
                        🔒 This section is only accessible to Administrators.
          </p>
          <ul style={{ marginTop: "12px", color: "var(--color-text-muted)", fontSize: "14px", lineHeight: 2 }}>
            <li>&#8226; Performance weights: Tests (70%) + Homework (30%)</li>
            <li>&#8226; Grading: Excellent &ge;90%, Very Good &ge;80%, Good &ge;70%</li>
            <li>&#8226; Average &ge;60%, Needs Improvement &ge;50%, At Risk &lt;50%</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
