import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { studentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const className = searchParams.get("className");
  const section = searchParams.get("section");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (className) where.className = className;
  if (section) where.section = section;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { rollNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      testResults: { include: { test: true } },
      homeworkRecords: true,
      _count: { select: { testResults: true, homeworkRecords: true } },
    },
    orderBy: [{ className: "asc" }, { section: "asc" }, { rollNumber: "asc" }],
  });

  return NextResponse.json({ data: students });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    const student = await prisma.student.create({
      data: {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
      },
    });
    return NextResponse.json({ data: student }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A student with this roll number already exists in this class and section" },
        { status: 409 }
      );
    }
    console.error("Student creation error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
