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
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      testResults: {
        include: {
          student: { select: { id: true, fullName: true, rollNumber: true } },
        },
        orderBy: { student: { rollNumber: "asc" } },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  return NextResponse.json({ data: test });
}

const saveResultsSchema = z.object({
  results: z.array(
    z.object({
      studentId: z.string(),
      obtainedMarks: z.number().min(0),
    })
  ),
  fullMarks: z.number().positive(),
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
  const parsed = saveResultsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { results, fullMarks } = parsed.data;

  // Validate marks don't exceed fullMarks
  const invalid = results.find((r) => r.obtainedMarks > fullMarks);
  if (invalid) {
    return NextResponse.json(
      { error: `Obtained marks cannot exceed full marks (${fullMarks})` },
      { status: 400 }
    );
  }

  await Promise.all(
    results.map((r) =>
      prisma.testResult.upsert({
        where: {
          testId_studentId: { testId: id, studentId: r.studentId },
        },
        update: { obtainedMarks: r.obtainedMarks },
        create: {
          testId: id,
          studentId: r.studentId,
          obtainedMarks: r.obtainedMarks,
        },
      })
    )
  );

  return NextResponse.json({ message: "Results saved" });
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
    await prisma.test.delete({ where: { id } });
    return NextResponse.json({ message: "Test deleted" });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}
