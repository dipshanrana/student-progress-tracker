import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { homeworkSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const className = searchParams.get("className");
  const section = searchParams.get("section");

  const where: Record<string, unknown> = {};
  if (className) where.className = className;
  if (section) where.section = section;

  const homeworks = await prisma.homework.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      homeworkRecords: {
        include: { student: { select: { id: true, fullName: true, rollNumber: true } } },
      },
      _count: { select: { homeworkRecords: true } },
    },
    orderBy: { assignedDate: "desc" },
  });

  return NextResponse.json({ data: homeworks });
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
  const parsed = homeworkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { assignedDate, dueDate, ...rest } = parsed.data;

  try {
    // Create homework
    const homework = await prisma.homework.create({
      data: {
        ...rest,
        assignedDate: new Date(assignedDate),
        dueDate: new Date(dueDate),
        createdById: session.user.id,
      },
    });

    // Auto-create NOT_COMPLETED records for all matching students
    const students = await prisma.student.findMany({
      where: { className: rest.className, section: rest.section },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.homeworkRecord.createMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: students.map((s: any) => ({
          studentId: s.id,
          homeworkId: homework.id,
          status: "NOT_COMPLETED" as const,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ data: homework }, { status: 201 });
  } catch (error) {
    console.error("Homework creation error:", error);
    return NextResponse.json({ error: "Failed to create homework" }, { status: 500 });
  }
}
