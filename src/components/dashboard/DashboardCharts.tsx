"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PERFORMANCE_COLORS, type PerformanceStatus } from "@/lib/constants";

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

interface DashboardChartsProps {
  students: StudentStat[];
  distribution: Record<PerformanceStatus, number>;
  testPerformanceChart: { name: string; subject: string; date: string; average: number }[];
  homeworkCompletionRate: number;
}

const SUBJECT_PERFORMANCE = [
  { subject: "Mathematics", score: 82, color: "#2563eb" },
  { subject: "Science", score: 79, color: "#16a34a" },
  { subject: "English", score: 64, color: "#d97706" },
  { subject: "Computer", score: 89, color: "#9333ea" },
  { subject: "Social Studies", score: 72, color: "#dc2626" },
];

export function DashboardCharts({
  students,
  distribution,
  testPerformanceChart,
}: DashboardChartsProps) {
  // Pie chart data
  const pieData = [
    { name: "Present", value: 91.2, color: "#16a34a" },
    { name: "Absent", value: 6.1, color: "#dc2626" },
    { name: "Late", value: 2.7, color: "#d97706" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
      {/* Performance Overview (Line Chart) */}
      <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Performance Overview</h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>Academic progression across terms</p>
          </div>
          <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontWeight: 600, color: "#475569" }}>
            This Term
          </span>
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                testPerformanceChart.length > 0
                  ? testPerformanceChart
                  : [
                      { name: "Jan", average: 40 },
                      { name: "Feb", average: 65 },
                      { name: "Mar", average: 50 },
                      { name: "Apr", average: 70 },
                      { name: "May", average: 60 },
                      { name: "Jun", average: 78 },
                    ]
              }
              margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, "Average"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Performance Progress Bars (Matching reference image) */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Subject Performance</h3>
            <p style={{ fontSize: "12px", color: "#64748b" }}>Average marks by department</p>
          </div>
          <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontWeight: 600, color: "#475569" }}>
            This Term
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
          {SUBJECT_PERFORMANCE.map((subj) => (
            <div key={subj.subject}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                <span>{subj.subject}</span>
                <span style={{ color: "#0f172a", fontWeight: 700 }}>{subj.score}%</span>
              </div>
              <div style={{ height: "7px", width: "100%", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${subj.score}%`, background: subj.color, borderRadius: "10px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Summary Donut (Matching reference image) */}
      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Attendance Summary</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ width: 140, height: 140, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={60} dataKey="value" stroke="none">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>91.2%</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Present</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>{d.name}</span>
                <span style={{ fontSize: "12px", color: "#0f172a", fontWeight: 700, marginLeft: "auto" }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
