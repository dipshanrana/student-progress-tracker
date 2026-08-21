import { AppShell } from "@/components/layout/AppShell";
import { HomeworkContent } from "@/components/homework/HomeworkContent";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Homework | Student Progress Tracker",
};

export default async function HomeworkPage() {
  const user = await requireUser();
  return (
    <AppShell title="Homework">
      <HomeworkContent isAdmin={user.role === "ADMIN"} />
    </AppShell>
  );
}
