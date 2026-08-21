import {
  TEST_WEIGHT,
  HOMEWORK_WEIGHT,
  PERFORMANCE_THRESHOLDS,
  type PerformanceStatus,
} from "./constants";

export function calculatePercentage(obtained: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100 * 10) / 10;
}

export function calculateStudentTestAverage(
  testResults: { obtainedMarks: number; test: { fullMarks: number } }[]
): number {
  if (testResults.length === 0) return 0;
  const percentages = testResults.map((r) =>
    calculatePercentage(r.obtainedMarks, r.test.fullMarks)
  );
  const sum = percentages.reduce((a, b) => a + b, 0);
  return Math.round((sum / percentages.length) * 10) / 10;
}

export function calculateHomeworkCompletion(
  records: { status: string }[]
): number {
  if (records.length === 0) return 0;
  const completed = records.filter((r) => r.status === "COMPLETED").length;
  return Math.round((completed / records.length) * 100 * 10) / 10;
}

export function calculateOverallPerformance(
  testAverage: number,
  homeworkCompletion: number
): number {
  return Math.round(
    (testAverage * TEST_WEIGHT + homeworkCompletion * HOMEWORK_WEIGHT) * 10
  ) / 10;
}

export function getPerformanceStatus(score: number): PerformanceStatus {
  if (score >= PERFORMANCE_THRESHOLDS.EXCELLENT) return "Excellent";
  if (score >= PERFORMANCE_THRESHOLDS.VERY_GOOD) return "Very Good";
  if (score >= PERFORMANCE_THRESHOLDS.GOOD) return "Good";
  if (score >= PERFORMANCE_THRESHOLDS.AVERAGE) return "Average";
  if (score >= PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT) return "Needs Improvement";
  return "At Risk";
}

export function calculateClassAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function groupByPerformance(scores: number[]): Record<PerformanceStatus, number> {
  const groups: Record<PerformanceStatus, number> = {
    Excellent: 0,
    "Very Good": 0,
    Good: 0,
    Average: 0,
    "Needs Improvement": 0,
    "At Risk": 0,
  };
  for (const score of scores) {
    groups[getPerformanceStatus(score)]++;
  }
  return groups;
}
