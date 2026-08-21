import type { UserRole, HomeworkStatus } from "@/generated/prisma/enums";
import type { PerformanceStatus } from "@/lib/constants";

export type { UserRole, HomeworkStatus, PerformanceStatus };

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface StudentWithStats {
  id: string;
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  gender?: string | null;
  testAverage: number;
  homeworkCompletion: number;
  overallScore: number;
  status: PerformanceStatus;
  testCount: number;
  homeworkCount: number;
}

export interface TestResultWithTest {
  id: string;
  obtainedMarks: number;
  test: {
    id: string;
    name: string;
    subject: string;
    testDate: Date;
    fullMarks: number;
  };
  percentage: number;
}

export interface HomeworkRecordWithHomework {
  id: string;
  status: HomeworkStatus;
  homework: {
    id: string;
    title: string;
    subject: string;
    assignedDate: Date;
    dueDate: Date;
  };
}

export interface DashboardStats {
  totalStudents: number;
  homeworkCompletionRate: number;
  averageTestScore: number;
  totalTests: number;
  studentsNeedingImprovement: number;
  highestPerformer: { name: string; score: number } | null;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: "homework" | "test" | "student" | "remark";
  description: string;
  time: Date;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
