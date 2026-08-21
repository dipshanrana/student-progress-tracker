import { AppShell } from "@/components/layout/AppShell";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Reports | Student Progress Tracker",
};

export default async function ReportsPage() {
  await requireUser();
  return (
    <AppShell title="Reports & Analytics">
      <ReportsContent />
    </AppShell>
  );
}
