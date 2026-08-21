import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}

export function isAdmin(role?: string | null) {
  return role === "ADMIN";
}
