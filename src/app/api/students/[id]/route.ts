import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { studentSchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      testResults: {
        include: { test: true },
        orderBy: { test: { testDate: "asc" } },
      },
      homeworkRecords: {
        include: { homework: true },
        orderBy: { homework: { assignedDate: "desc" } },
      },
      remarks: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ data: student });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = studentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { dateOfBirth, admissionDate, ...rest } = parsed.data;

  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
      },
    });
    return NextResponse.json({ data: student });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A student with this roll number already exists in this class and section" },
        { status: 409 }
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    console.error("Student update error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    console.error("Student deletion error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
