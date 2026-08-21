"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { PerformanceBadge } from "@/components/ui/PerformanceBadge";
import { DashboardCharts } from "./DashboardCharts";
import type { PerformanceStatus } from "@/lib/constants";

interface StudentStat {
  id: string;
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  testAverage: number;
  homeworkCompletion: number;
  overallScore: number;
  status: PerformanceStatus;
}

interface DashboardData {
  summary: {
    totalStudents: number;
    totalTests: number;
    totalHomework: number;
    homeworkCompletionRate: number;
    averageScore: number;
  };
  students: StudentStat[];
  distribution: Record<PerformanceStatus, number>;
  testPerformanceChart: { name: string; subject: string; date: string; average: number }[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, background: "#d1fae5", padding: "2px 8px", borderRadius: "20px" }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginTop: "4px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{subtitle}</div>
    </div>
  );
}

export function DashboardContent({ userRole }: { userRole: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, students, distribution, testPerformanceChart } = data;

  const sorted = [...students].sort((a, b) => b.overallScore - a.overallScore);
  const topStudent = sorted[0];
  const needingImprovement = students.filter(
    (s) => s.status === "Needs Improvement" || s.status === "At Risk"
  );

  return (
    <div>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          subtitle="Enrolled students"
          icon={<Users size={22} />}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
        />
        <StatCard
          title="Homework Completion"
          value={`${summary.homeworkCompletionRate}%`}
          subtitle="Overall completion rate"
          icon={<BookOpen size={22} />}
          iconBg="#d1fae5"
          iconColor="#059669"
        />
        <StatCard
          title="Average Score"
          value={`${summary.averageScore}%`}
          subtitle="Class overall average"
          icon={<TrendingUp size={22} />}
          iconBg="#dbeafe"
          iconColor="#2563eb"
        />
        <StatCard
          title="Total Tests"
          value={summary.totalTests}
          subtitle="Tests conducted"
          icon={<ClipboardList size={22} />}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
      </div>

      {/* Charts */}
      <div style={{ marginBottom: "24px" }}>
        <DashboardCharts
          students={students}
          distribution={distribution}
          testPerformanceChart={testPerformanceChart}
          homeworkCompletionRate={summary.homeworkCompletionRate}
        />
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Top Performer */}
        {topStudent && (
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Trophy size={18} color="#f59e0b" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Top Performer</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                {topStudent.fullName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>
                  {topStudent.fullName}
                </div>
                <div style={{ color: "#64748b", fontSize: "13px" }}>
                  Roll #{topStudent.rollNumber} Ã‚Â· Class {topStudent.className}-{topStudent.section}
                </div>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>
                    {topStudent.overallScore.toFixed(0)}%
                  </span>
                  <PerformanceBadge status={topStudent.status} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Needing Attention */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Needs Attention ({needingImprovement.length})
            </h3>
          </div>
          {needingImprovement.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Ã°Å¸Å½â€° All students are performing well!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {needingImprovement.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>
                      {s.fullName}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "12px" }}>
                      Class {s.className}-{s.section}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#dc2626", fontSize: "14px" }}>
                      {s.overallScore.toFixed(0)}%
                    </div>
                    <PerformanceBadge status={s.status} />
                  </div>
                </div>
              ))}
              {needingImprovement.length > 4 && (
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                  +{needingImprovement.length - 4} more students
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
