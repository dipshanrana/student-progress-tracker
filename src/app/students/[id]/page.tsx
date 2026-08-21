import { AppShell } from "@/components/layout/AppShell";
import { StudentProfile } from "@/components/students/StudentProfile";
import { requireUser } from "@/lib/permissions";

export const metadata = {
  title: "Student Profile | Student Progress Tracker",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  return (
    <AppShell title="Student Profile">
      <StudentProfile studentId={id} isAdmin={user.role === "ADMIN"} />
    </AppShell>
  );
}
