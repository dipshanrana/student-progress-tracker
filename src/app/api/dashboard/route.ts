import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  calculateStudentTestAverage,
  calculateHomeworkCompletion,
  calculateOverallPerformance,
  getPerformanceStatus,
  groupByPerformance,
} from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const className = searchParams.get("className");
  const section = searchParams.get("section");

  const studentWhere: Record<string, unknown> = {};
  if (className) studentWhere.className = className;
  if (section) studentWhere.section = section;

  const [totalStudents, totalTests, totalHomework, allRecords] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.test.count({ where: className ? { className, ...(section ? { section } : {}) } : {} }),
    prisma.homework.count({ where: className ? { className, ...(section ? { section } : {}) } : {} }),
    prisma.homeworkRecord.findMany({
      where: className ? { homework: { className, ...(section ? { section } : {}) } } : {},
    }),
  ]);

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      testResults: { include: { test: true } },
      homeworkRecords: true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentsWithStats = students.map((s: any) => {
    const testAverage = calculateStudentTestAverage(s.testResults);
    const homeworkCompletion = calculateHomeworkCompletion(s.homeworkRecords);
    const overallScore = calculateOverallPerformance(testAverage, homeworkCompletion);
    return {
      id: s.id,
      fullName: s.fullName,
      rollNumber: s.rollNumber,
      className: s.className,
      section: s.section,
      testAverage,
      homeworkCompletion,
      overallScore,
      status: getPerformanceStatus(overallScore),
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overallScores = studentsWithStats.map((s: any) => s.overallScore);
  const distribution = groupByPerformance(overallScores);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCompleted = allRecords.filter((r: any) => r.status === "COMPLETED").length;
  const homeworkCompletionRate =
    allRecords.length > 0 ? Math.round((totalCompleted / allRecords.length) * 100) : 0;
  const averageScore =
    overallScores.length > 0
      ? Math.round(overallScores.reduce((a: number, b: number) => a + b, 0) / overallScores.length)
      : 0;

  // Test performance over time (grouped by test date)
  const tests = await prisma.test.findMany({
    where: className ? { className } : {},
    include: { testResults: true },
    orderBy: { testDate: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testPerformanceChart = tests.map((t: any) => {
    const avgPercent =
      t.testResults.length > 0
        ? Math.round(
            t.testResults.reduce((sum: number, r: any) => sum + (r.obtainedMarks / t.fullMarks) * 100, 0) /
              t.testResults.length
          )
        : 0;
    return {
      name: t.name,
      subject: t.subject,
      date: t.testDate,
      average: avgPercent,
    };
  });

  return NextResponse.json({
    data: {
      summary: {
        totalStudents,
        totalTests,
        totalHomework,
        homeworkCompletionRate,
        averageScore,
      },
      students: studentsWithStats,
      distribution,
      testPerformanceChart,
    },
  });
}
