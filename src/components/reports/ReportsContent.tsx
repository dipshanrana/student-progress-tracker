"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Loader2, Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { PerformanceBadge } from "@/components/ui/PerformanceBadge";
import { CLASSES, SECTIONS, PERFORMANCE_COLORS } from "@/lib/constants";
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

interface ReportData {
  summary: {
    totalStudents: number;
    totalTests: number;
    totalHomework: number;
    homeworkCompletionRate: number;
    averageScore: number;
  };
  students: StudentStat[];
  distribution: Record<PerformanceStatus, number>;
  testPerformanceChart: { name: string; subject: string; average: number }[];
}

export function ReportsContent() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (classFilter) params.set("className", classFilter);
    if (sectionFilter) params.set("section", sectionFilter);
    const res = await fetch(`/api/reports?${params}`);
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }, [classFilter, sectionFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#4f46e5" }} />
      </div>
    );
  }

  if (!data) return null;

  const { summary, students, distribution, testPerformanceChart } = data;
  const sorted = [...students].sort((a, b) => b.overallScore - a.overallScore);

  const distributionData = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: PERFORMANCE_COLORS[name as PerformanceStatus] }));

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ width: "auto", minWidth: "120px" }}>
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select className="input" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ width: "auto", minWidth: "110px" }}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Students", value: summary.totalStudents, icon: <Users size={20} />, bg: "#ede9fe", color: "#7c3aed" },
          { label: "Total Tests", value: summary.totalTests, icon: <ClipboardList size={20} />, bg: "#fef3c7", color: "#d97706" },
          { label: "Total Homework", value: summary.totalHomework, icon: <BookOpen size={20} />, bg: "#d1fae5", color: "#059669" },
          { label: "Avg Overall Score", value: `${summary.averageScore}%`, icon: <TrendingUp size={20} />, bg: "#dbeafe", color: "#2563eb" },
          { label: "Homework Completion", value: `${summary.homeworkCompletionRate}%`, icon: <BookOpen size={20} />, bg: "#d1fae5", color: "#059669" },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, marginBottom: "10px" }}>
              {card.icon}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* Student Ranking Bar */}
        {sorted.length > 0 && (
          <div className="card" style={{ padding: "20px", gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Student Rankings</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sorted.slice(0, 12).map((s) => ({ name: s.fullName.split(" ")[0], score: s.overallScore, tests: s.testAverage, homework: s.homeworkCompletion }))} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v, name) => [`${v}%`, name === "score" ? "Overall" : name === "tests" ? "Test Avg" : "Homework"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Test Performance */}
        {testPerformanceChart.length > 0 && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Test Performance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={testPerformanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="average" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: "#4f46e5", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance Distribution */}
        {distributionData.length > 0 && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Performance Distribution</h3>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {distributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {distributionData.map((d) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: "12px", color: "#374151" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Table */}
      {students.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Student Report Summary</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Test Avg</th>
                <th>Homework</th>
                <th>Overall</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: i < 3 ? "#f59e0b" : "#94a3b8" }}>#{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Roll #{s.rollNumber}</div>
                  </td>
                  <td>
                    <span style={{ background: "#ede9fe", color: "#4f46e5", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 600 }}>
                      {s.className}-{s.section}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#374151" }}>{s.testAverage.toFixed(1)}%</td>
                  <td style={{ fontWeight: 600, color: "#374151" }}>{s.homeworkCompletion.toFixed(1)}%</td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{s.overallScore.toFixed(1)}%</td>
                  <td><PerformanceBadge status={s.status} /></td>
                  <td>
                    <Link href={`/students/${s.id}`} style={{ color: "#4f46e5", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                      View Profile â†’
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
