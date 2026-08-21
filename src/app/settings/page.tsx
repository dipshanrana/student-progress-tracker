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
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Admin Settings</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
          Manage application settings and configurations.
        </p>
        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#374151", fontSize: "14px" }}>
            ðŸ”’ This section is only accessible to Administrators.
          </p>
          <ul style={{ marginTop: "12px", color: "#64748b", fontSize: "14px", lineHeight: 2 }}>
            <li>â€¢ Performance weights: Tests (70%) + Homework (30%)</li>
            <li>â€¢ Grading: Excellent â‰¥90%, Very Good â‰¥80%, Good â‰¥70%</li>
            <li>â€¢ Average â‰¥60%, Needs Improvement â‰¥50%, At Risk &lt;50%</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
