"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { PerformanceStatus } from "@/lib/constants";
import { PERFORMANCE_COLORS } from "@/lib/constants";

interface StudentStat {
  id: string;
  fullName: string;
  overallScore: number;
  testAverage: number;
  homeworkCompletion: number;
  status: PerformanceStatus;
}

interface DashboardChartsProps {
  students: StudentStat[];
  distribution: Record<PerformanceStatus, number>;
  testPerformanceChart: { name: string; subject: string; average: number }[];
  homeworkCompletionRate: number;
}

export function DashboardCharts({
  students,
  distribution,
  testPerformanceChart,
  homeworkCompletionRate,
}: DashboardChartsProps) {
  const performanceData = Object.entries(distribution)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: PERFORMANCE_COLORS[name as PerformanceStatus],
    }));

  const homeworkPieData = [
    { name: "Completed", value: homeworkCompletionRate, color: "var(--color-success)" },
    { name: "Not Completed", value: 100 - homeworkCompletionRate, color: "var(--color-border)" },
  ];

  const studentBarData = students
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 10)
    .map((s) => ({
      name: s.fullName.split(" ")[0],
      score: s.overallScore,
      tests: s.testAverage,
      homework: s.homeworkCompletion,
    }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
      {/* Test Performance Over Time */}
      {testPerformanceChart.length > 0 && (
        <div className="card" style={{ padding: "20px", gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "4px" }}>
            Test Performance Trend
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
            Class average percentage across tests
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={testPerformanceChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Avg Score"]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: "var(--color-primary)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student Performance Bar Chart */}
      {studentBarData.length > 0 && (
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "4px" }}>
            Student Scores
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
            Top 10 students by overall score
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={studentBarData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name === "score" ? "Overall" : name === "tests" ? "Test Avg" : "Homework",
                ]}
                contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)" }}
              />
              <Legend
                formatter={(value) =>
                  value === "score" ? "Overall" : value === "tests" ? "Tests" : "Homework"
                }
              />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="homework" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Homework Completion Donut */}
      <div className="card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "4px" }}>
          Homework Completion
        </h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
          Overall completion rate
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ position: "relative" }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={homeworkPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {homeworkPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text-dark)" }}>
                {homeworkCompletionRate}%
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      {performanceData.length > 0 && (
        <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "4px" }}>
            Performance Distribution
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
            Students by performance level
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                isAnimationActive={false}
              >
                {performanceData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "13px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend below chart */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: "12px" }}>
            {performanceData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{d.name}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-dark)", marginLeft: "auto" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
