import { AppShell } from "@/components/layout/AppShell";
import { StudentsContent } from "@/components/students/StudentsContent";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Students | Student Progress Tracker",
};

export default async function StudentsPage() {
  const user = await requireUser();
  return (
    <AppShell title="Students">
      <StudentsContent isAdmin={user.role === "ADMIN"} />
    </AppShell>
  );
}
