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
          <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: 600, background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "20px" }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-text-dark)", lineHeight: 1 }}>
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
          iconBg="rgba(109, 40, 217, 0.1)"
          iconColor="var(--color-primary-light)"
        />
        <StatCard
          title="Homework Completion"
          value={`${summary.homeworkCompletionRate}%`}
          subtitle="Overall completion rate"
          icon={<BookOpen size={22} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="var(--color-success)"
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
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="var(--color-warning)"
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
              <Trophy size={18} color="var(--color-warning)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>Top Performer</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-warning), var(--color-warning))",
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
                <div style={{ fontWeight: 700, color: "var(--color-text-dark)", fontSize: "15px" }}>
                  {topStudent.fullName}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                  Roll #{topStudent.rollNumber} &middot; Class {topStudent.className}-{topStudent.section}
                </div>
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-success)" }}>
                    {topStudent.overallScore.toFixed(0)}%
                  </span>
                  <PerformanceBadge status={topStudent.status} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Needing Attention */}
        <div className="card" style={{ padding: 0, overflow: "hidden", gridColumn: topStudent ? "auto" : "1 / -1" }}>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} color="var(--color-danger)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>
                Needs Attention ({needingImprovement.length})
              </h3>
            </div>
            {needingImprovement.length > 0 && (
              <a href="/students" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>View all &rarr;</a>
            )}
          </div>
          {needingImprovement.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>&#127881;</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>All students are performing well!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "400px" }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {needingImprovement.slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td style={{ color: "var(--color-text-muted)" }}>{s.className}-{s.section}</td>
                      <td style={{ fontWeight: 700, color: s.overallScore < 50 ? "var(--color-danger)" : "var(--color-warning)" }}>
                        {s.overallScore.toFixed(0)}%
                      </td>
                      <td><PerformanceBadge status={s.status} /></td>
                      <td>
                        <a href={`/students/${s.id}`} style={{ color: "var(--color-primary)", fontSize: "13px", textDecoration: "none", fontWeight: 500 }}>View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {needingImprovement.length > 5 && (
                <div style={{ padding: "10px 20px", borderTop: "1px solid var(--color-border)" }}>
                  <a href="/students" style={{ color: "#94a3b8", fontSize: "12px", textDecoration: "none" }}>
                    +{needingImprovement.length - 5} more students need attention
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
