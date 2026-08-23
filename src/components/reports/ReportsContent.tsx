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
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
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
    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "16px" }}>
        <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ fontSize: "13px", padding: "7px 10px" }}>
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select className="input" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ fontSize: "13px", padding: "7px 10px" }}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: "Total Students", value: summary.totalStudents, icon: <Users size={16} />, bg: "rgba(109,40,217,0.1)", color: "var(--color-primary-light)" },
          { label: "Total Tests", value: summary.totalTests, icon: <ClipboardList size={16} />, bg: "rgba(245,158,11,0.15)", color: "var(--color-warning)" },
          { label: "Total Homework", value: summary.totalHomework, icon: <BookOpen size={16} />, bg: "rgba(16,185,129,0.15)", color: "var(--color-success)" },
          { label: "Avg Score", value: `${summary.averageScore}%`, icon: <TrendingUp size={16} />, bg: "#dbeafe", color: "#2563eb" },
          { label: "HW Completion", value: `${summary.homeworkCompletionRate}%`, icon: <BookOpen size={16} />, bg: "rgba(16,185,129,0.15)", color: "var(--color-success)" },
        ].map((card) => (
          <div key={card.label} className="stat-card" style={{ padding: "12px 14px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, marginBottom: "8px" }}>
              {card.icon}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text-dark)", lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
        {/* Rankings Bar Chart */}
        {sorted.length > 0 && (
          <div className="card" style={{ padding: "16px", width: "100%", overflow: "hidden" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "12px" }}>Student Rankings</h3>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted.slice(0, 10).map((s) => ({
                    name: s.fullName.split(" ")[0],
                    score: parseFloat(s.overallScore.toFixed(1)),
                  }))}
                  barSize={16}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Overall"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          {testPerformanceChart.length > 0 && (
            <div className="card" style={{ padding: "16px", overflow: "hidden" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "12px" }}>Test Performance Trend</h3>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testPerformanceChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="average" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: "var(--color-primary)", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {distributionData.length > 0 && (
            <div className="card" style={{ padding: "16px", overflow: "hidden" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "12px" }}>Performance Distribution</h3>
              <div style={{ height: 140, marginBottom: "12px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" outerRadius={60} dataKey="value" innerRadius={24}>
                      {distributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
                {distributionData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: "#374151" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-dark)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Table */}
      {students.length > 0 && (
        <div className="card" style={{ overflow: "hidden", width: "100%" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-surface-hover)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-dark)" }}>
              Student Report Summary
              <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-muted)", marginLeft: "6px" }}>({students.length})</span>
            </h3>
          </div>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table style={{ minWidth: "580px", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "16px" }}>#</th>
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
                    <td style={{ paddingLeft: "16px", fontWeight: 700, color: i < 3 ? "var(--color-warning)" : "#94a3b8" }}>#{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Roll #{s.rollNumber}</div>
                    </td>
                    <td>
                      <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--color-primary)", padding: "2px 6px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {s.className}-{s.section}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{s.testAverage.toFixed(1)}%</td>
                    <td style={{ fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{s.homeworkCompletion.toFixed(1)}%</td>
                    <td style={{ fontWeight: 700, color: "var(--color-text-dark)", whiteSpace: "nowrap" }}>{s.overallScore.toFixed(1)}%</td>
                    <td><PerformanceBadge status={s.status} /></td>
                    <td>
                      <Link href={`/students/${s.id}`} style={{ color: "var(--color-primary)", fontSize: "12px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
