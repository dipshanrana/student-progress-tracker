export const TEST_WEIGHT = 0.7;
export const HOMEWORK_WEIGHT = 0.3;

export const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
export const SECTIONS = ["A", "B", "C", "D", "E"];
export const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Nepali",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
];

export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
  AVERAGE: 60,
  NEEDS_IMPROVEMENT: 50,
} as const;

export type PerformanceStatus =
  | "Excellent"
  | "Very Good"
  | "Good"
  | "Average"
  | "Needs Improvement"
  | "At Risk";

export const PERFORMANCE_COLORS: Record<PerformanceStatus, string> = {
  Excellent: "#10b981",
  "Very Good": "#3b82f6",
  Good: "#8b5cf6",
  Average: "#f59e0b",
  "Needs Improvement": "#ef4444",
  "At Risk": "#dc2626",
};
