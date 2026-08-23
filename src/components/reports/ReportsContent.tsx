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
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ flex: "1 1 130px", minWidth: "110px", maxWidth: "180px", fontSize: "14px" }}>
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select className="input" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ flex: "1 1 130px", minWidth: "110px", maxWidth: "180px", fontSize: "14px" }}>
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Summary Cards — responsive grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Students", value: summary.totalStudents, icon: <Users size={18} />, bg: "rgba(109,40,217,0.1)", color: "var(--color-primary-light)" },
          { label: "Total Tests", value: summary.totalTests, icon: <ClipboardList size={18} />, bg: "rgba(245,158,11,0.15)", color: "var(--color-warning)" },
          { label: "Total Homework", value: summary.totalHomework, icon: <BookOpen size={18} />, bg: "rgba(16,185,129,0.15)", color: "var(--color-success)" },
          { label: "Avg Score", value: `${summary.averageScore}%`, icon: <TrendingUp size={18} />, bg: "#dbeafe", color: "#2563eb" },
          { label: "HW Completion", value: `${summary.homeworkCompletionRate}%`, icon: <BookOpen size={18} />, bg: "rgba(16,185,129,0.15)", color: "var(--color-success)" },
        ].map((card) => (
          <div key={card.label} className="stat-card" style={{ padding: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color, marginBottom: "10px" }}>
              {card.icon}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-text-dark)", lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts — single column on mobile, side-by-side on desktop */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

        {/* Student Rankings Bar Chart — full width */}
        {sorted.length > 0 && (
          <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Student Rankings</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={sorted.slice(0, 12).map((s) => ({
                  name: s.fullName.split(" ")[0],
                  score: parseFloat(s.overallScore.toFixed(1)),
                }))}
                barSize={20}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={38} />
                <Tooltip formatter={(v) => [`${v}%`, "Overall"]} contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Row of 2 charts — stack on mobile, side by side on wider screens */}
        {(testPerformanceChart.length > 0 || distributionData.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>

            {/* Test Performance Trend */}
            {testPerformanceChart.length > 0 && (
              <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Test Performance Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={testPerformanceChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={38} />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "13px" }} />
                    <Line type="monotone" dataKey="average" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: "var(--color-primary)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Distribution */}
            {distributionData.length > 0 && (
              <div className="card" style={{ padding: "20px", overflow: "hidden" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Performance Distribution</h3>
                {/* Pie + legend stacked vertically for consistent layout */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={distributionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" innerRadius={30}>
                        {distributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                  {distributionData.map((d) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#374151" }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-dark)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Table — horizontally scrollable on mobile */}
      {students.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-surface-hover)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>
              Student Report Summary
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)", marginLeft: "8px" }}>({students.length})</span>
            </h3>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ minWidth: "620px" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "20px" }}>#</th>
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
                    <td style={{ paddingLeft: "20px", fontWeight: 700, color: i < 3 ? "var(--color-warning)" : "#94a3b8" }}>#{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>Roll #{s.rollNumber}</div>
                    </td>
                    <td>
                      <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {s.className}-{s.section}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{s.testAverage.toFixed(1)}%</td>
                    <td style={{ fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{s.homeworkCompletion.toFixed(1)}%</td>
                    <td style={{ fontWeight: 700, color: "var(--color-text-dark)", whiteSpace: "nowrap" }}>{s.overallScore.toFixed(1)}%</td>
                    <td><PerformanceBadge status={s.status} /></td>
                    <td>
                      <Link href={`/students/${s.id}`} style={{ color: "var(--color-primary)", fontSize: "13px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
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

      {students.length === 0 && (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px", color: "var(--color-border)" }}>&#128202;</div>
          <h3 style={{ fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "6px" }}>No data available</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Add students and record test results to generate reports.
          </p>
        </div>
      )}
    </div>
  );
}
