import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const homework = await prisma.homework.findUnique({
    where: { id },
    include: {
      homeworkRecords: {
        include: {
          student: {
            select: { id: true, fullName: true, rollNumber: true, section: true },
          },
        },
        orderBy: { student: { rollNumber: "asc" } },
      },
    },
  });

  if (!homework) {
    return NextResponse.json({ error: "Homework not found" }, { status: 404 });
  }

  return NextResponse.json({ data: homework });
}

const updateRecordsSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["COMPLETED", "NOT_COMPLETED"]),
    })
  ),
});

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
  const parsed = updateRecordsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  // Upsert each record
  await Promise.all(
    parsed.data.records.map((r) =>
      prisma.homeworkRecord.upsert({
        where: {
          studentId_homeworkId: {
            studentId: r.studentId,
            homeworkId: id,
          },
        },
        update: { status: r.status },
        create: {
          studentId: r.studentId,
          homeworkId: id,
          status: r.status,
        },
      })
    )
  );

  return NextResponse.json({ message: "Records updated" });
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
    await prisma.homework.delete({ where: { id } });
    return NextResponse.json({ message: "Homework deleted" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete homework" }, { status: 500 });
  }
}
