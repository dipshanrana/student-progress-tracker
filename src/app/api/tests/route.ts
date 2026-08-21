import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { testSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const className = searchParams.get("className");
  const section = searchParams.get("section");
  const subject = searchParams.get("subject");

  const where: Record<string, unknown> = {};
  if (className) where.className = className;
  if (section) where.section = section;
  if (subject) where.subject = subject;

  const tests = await prisma.test.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      testResults: {
        include: { student: { select: { id: true, fullName: true, rollNumber: true } } },
      },
      _count: { select: { testResults: true } },
    },
    orderBy: { testDate: "desc" },
  });

  return NextResponse.json({ data: tests });
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
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { testDate, ...rest } = parsed.data;

  try {
    const test = await prisma.test.create({
      data: {
        ...rest,
        testDate: new Date(testDate),
        createdById: session.user.id,
      },
    });
    return NextResponse.json({ data: test }, { status: 201 });
  } catch (error) {
    console.error("Test creation error:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}
