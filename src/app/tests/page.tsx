import { AppShell } from "@/components/layout/AppShell";
import { TestsContent } from "@/components/tests/TestsContent";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Tests | Student Progress Tracker",
};

export default async function TestsPage() {
  const user = await requireUser();
  return (
    <AppShell title="Tests">
      <TestsContent isAdmin={user.role === "ADMIN"} />
    </AppShell>
  );
}
