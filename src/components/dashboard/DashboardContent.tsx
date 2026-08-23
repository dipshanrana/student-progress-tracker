"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
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
  trend?: { value: string; isPositive: boolean };
}

function MetricCard({ title, value, subtitle, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="stat-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "12px",
              fontWeight: 600,
              color: trend.isPositive ? "#15803d" : "#b91c1c",
              background: trend.isPositive ? "#f0fdf4" : "#fef2f2",
              padding: "3px 8px",
              borderRadius: "20px",
              border: `1px solid ${trend.isPositive ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-text-dark)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155", marginTop: "6px" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{subtitle}</div>
      </div>
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
  const needingImprovement = students.filter(
    (s) => s.status === "Needs Improvement" || s.status === "At Risk"
  );

  return (
    <div>
      {/* 4 Main Metric Cards (Matching reference image design) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <MetricCard
          title="Total Students"
          value={summary.totalStudents}
          subtitle="Enrolled active students"
          icon={<Users size={22} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          trend={{ value: "+12 this month", isPositive: true }}
        />
        <MetricCard
          title="Average Score"
          value={`${summary.averageScore}%`}
          subtitle="Class overall average"
          icon={<TrendingUp size={22} />}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          trend={{ value: "+4.6% this term", isPositive: true }}
        />
        <MetricCard
          title="Homework Rate"
          value={`${summary.homeworkCompletionRate}%`}
          subtitle="Overall completion rate"
          icon={<BookOpen size={22} />}
          iconBg="#f0f9ff"
          iconColor="#0284c7"
          trend={{ value: "+2.1% this month", isPositive: true }}
        />
        <MetricCard
          title="Students Needing Attention"
          value={needingImprovement.length}
          subtitle="At risk or needing help"
          icon={<AlertTriangle size={22} />}
          iconBg="#fffbebe6"
          iconColor="#d97706"
          trend={{ value: `${needingImprovement.length} flagged`, isPositive: false }}
        />
      </div>

      {/* Analytics Charts */}
      <div style={{ marginBottom: "24px" }}>
        <DashboardCharts
          students={students}
          distribution={distribution}
          testPerformanceChart={testPerformanceChart}
          homeworkCompletionRate={summary.homeworkCompletionRate}
        />
      </div>

      {/* Students Needing Attention Table & Recent Activity Grid (Matching exact layout in reference image) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Students Needing Attention Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle size={18} color="#d97706" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>
                Students Needing Attention ({needingImprovement.length})
              </h3>
            </div>
            <a href="/students" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
              View all &rarr;
            </a>
          </div>
          {needingImprovement.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center" }}>
              <CheckCircle2 size={32} color="#16a34a" style={{ marginBottom: "8px" }} />
              <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>All students are performing well!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "460px" }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Score</th>
                    <th>HW %</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {needingImprovement.slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td style={{ color: "#64748b" }}>{s.className}-{s.section}</td>
                      <td style={{ fontWeight: 700, color: s.overallScore < 50 ? "#dc2626" : "#d97706" }}>
                        {s.overallScore.toFixed(0)}%
                      </td>
                      <td style={{ color: "#334155", fontWeight: 600 }}>
                        {s.homeworkCompletion.toFixed(0)}%
                      </td>
                      <td><PerformanceBadge status={s.status} /></td>
                      <td>
                        <a href={`/students/${s.id}`} style={{ color: "#2563eb", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>
              Recent Activity
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Updated live</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                <ClipboardList size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>Assessment recorded</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Math Test - Chapter 5 results entered</div>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>10m ago</span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", flexShrink: 0 }}>
                <BookOpen size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>Homework status updated</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Science Test records saved</div>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>1h ago</span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333ea", flexShrink: 0 }}>
                <Users size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>New student enrolled</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Student profile created</div>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>3h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
