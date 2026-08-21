import { AppShell } from "@/components/layout/AppShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Dashboard | Student Progress Tracker",
};

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <AppShell title="Dashboard">
      <DashboardContent userRole={user.role as string} />
    </AppShell>
  );
}
