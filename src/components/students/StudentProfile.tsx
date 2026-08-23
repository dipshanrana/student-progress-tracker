"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  User,
  Printer,
  Send,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { PerformanceBadge, ScoreBar } from "@/components/ui/PerformanceBadge";
import { Toast, useToast } from "@/components/ui/Toast";
import {
  calculateStudentTestAverage,
  calculateHomeworkCompletion,
  calculateOverallPerformance,
  getPerformanceStatus,
  calculatePercentage,
} from "@/lib/analytics";
import { format } from "./dateUtils";

interface TestResult {
  id: string;
  obtainedMarks: number;
  test: { id: string; name: string; subject: string; testDate: string; fullMarks: number };
}

interface HomeworkRecord {
  id: string;
  status: string;
  homework: { id: string; title: string; subject: string; assignedDate: string; dueDate: string };
}

interface Remark {
  id: string;
  remark: string;
  createdAt: string;
  createdBy: { name: string };
}

interface StudentData {
  id: string;
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  gender?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  address?: string | null;
  admissionDate?: string | null;
  notes?: string | null;
  testResults: TestResult[];
  homeworkRecords: HomeworkRecord[];
  remarks: Remark[];
}

type Tab = "overview" | "tests" | "homework" | "progress" | "remarks";

export function StudentProfile({ studentId, isAdmin }: { studentId: string; isAdmin: boolean }) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [remarkText, setRemarkText] = useState("");
  const [remarkLoading, setRemarkLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchStudent = useCallback(async () => {
    const res = await fetch(`/api/students/${studentId}`);
    const json = await res.json();
    setStudent(json.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  async function addRemark() {
    if (!remarkText.trim()) return;
    setRemarkLoading(true);
    const res = await fetch("/api/remarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, remark: remarkText }),
    });
    setRemarkLoading(false);
    if (res.ok) {
      setRemarkText("");
      fetchStudent();
      showToast("Remark added!", "success");
    } else {
      showToast("Failed to add remark", "error");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Student not found.</p>
        <Link href="/students" className="btn-primary" style={{ display: "inline-flex", marginTop: "12px" }}>
          Back to Students
        </Link>
      </div>
    );
  }

  const testAverage = calculateStudentTestAverage(student.testResults);
  const homeworkCompletion = calculateHomeworkCompletion(student.homeworkRecords);
  const overallScore = calculateOverallPerformance(testAverage, homeworkCompletion);
  const status = getPerformanceStatus(overallScore);

  const testChartData = student.testResults.map((r) => ({
    name: r.test.name,
    subject: r.test.subject,
    percentage: calculatePercentage(r.obtainedMarks, r.test.fullMarks),
    date: format(r.test.testDate),
  }));

  const homeworkChartData = Object.entries(
    student.homeworkRecords.reduce<Record<string, { completed: number; total: number }>>((acc, r) => {
      const month = r.homework.assignedDate.slice(0, 7);
      if (!acc[month]) acc[month] = { completed: 0, total: 0 };
      acc[month].total++;
      if (r.status === "COMPLETED") acc[month].completed++;
      return acc;
    }, {})
  ).map(([month, d]) => ({
    month,
    completed: d.completed,
    notCompleted: d.total - d.completed,
    rate: Math.round((d.completed / d.total) * 100),
  }));

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <User size={15} /> },
    { id: "tests", label: `Tests (${student.testResults.length})`, icon: <ClipboardList size={15} /> },
    { id: "homework", label: `Homework (${student.homeworkRecords.length})`, icon: <BookOpen size={15} /> },
    { id: "progress", label: "Progress", icon: <TrendingUp size={15} /> },
    { id: "remarks", label: `Remarks (${student.remarks.length})`, icon: <MessageSquare size={15} /> },
  ];

  return (
    <div>
      {/* Back + Print */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }} className="no-print">
        <Link href="/students" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Students
        </Link>
        <button onClick={() => window.print()} className="btn-secondary">
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Profile Header */}
      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {student.fullName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-text-dark)" }}>{student.fullName}</h2>
              <PerformanceBadge status={status} />
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "var(--color-text-muted)", fontSize: "14px" }}>
              <span>Roll #{student.rollNumber}</span>
              <span>&middot;</span>
              <span>Class {student.className}-{student.section}</span>
              {student.gender && <><span>&middot;</span><span>{student.gender}</span></>}
              {student.guardianName && <><span>&middot;</span><span>Guardian: {student.guardianName}</span></>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", minWidth: "200px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)" }}>{testAverage.toFixed(0)}%</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Test Avg</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-success)" }}>{homeworkCompletion.toFixed(0)}%</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Homework</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text-dark)" }}>{overallScore.toFixed(0)}%</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Overall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "white", padding: "6px", borderRadius: "10px", border: "1px solid var(--color-border)", overflowX: "auto" }} className="no-print">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Performance Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Test Average</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{testAverage.toFixed(1)}%</span>
                </div>
                <ScoreBar score={testAverage} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Homework Completion</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{homeworkCompletion.toFixed(1)}%</span>
                </div>
                <ScoreBar score={homeworkCompletion} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Overall Score (70% tests + 30% hw)</span>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{overallScore.toFixed(1)}%</span>
                </div>
                <ScoreBar score={overallScore} />
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Student Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ["Class", `${student.className}-${student.section}`],
                ["Roll Number", student.rollNumber],
                ["Gender", student.gender],
                ["Guardian", student.guardianName],
                ["Phone", student.guardianPhone],
                ["Address", student.address],
                ["Admission", student.admissionDate ? format(student.admissionDate) : null],
                ["Notes", student.notes],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8", minWidth: "90px" }}>{label}:</span>
                    <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tests" && (
        <div className="card">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-surface-hover)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>Test History</h3>
          </div>
          {student.testResults.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>No test results yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {student.testResults.map((r) => {
                  const pct = calculatePercentage(r.obtainedMarks, r.test.fullMarks);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: "var(--color-text-muted)" }}>{format(r.test.testDate)}</td>
                      <td style={{ fontWeight: 600 }}>{r.test.name}</td>
                      <td>{r.test.subject}</td>
                      <td>{r.obtainedMarks} / {r.test.fullMarks}</td>
                      <td><ScoreBar score={pct} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "homework" && (
        <div className="card">
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-surface-hover)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>Homework History</h3>
          </div>
          {student.homeworkRecords.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>No homework records yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Homework</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.homeworkRecords.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--color-text-muted)" }}>{format(r.homework.assignedDate)}</td>
                    <td style={{ fontWeight: 600 }}>{r.homework.title}</td>
                    <td>{r.homework.subject}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{format(r.homework.dueDate)}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: r.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.1)",
                          color: r.status === "COMPLETED" ? "#065f46" : "#991b1b",
                        }}
                      >
                        {r.status === "COMPLETED" ? "Completed" : "Not Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "progress" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {testChartData.length > 0 && (
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>
                Test Progress
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={testChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]} contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)" }} />
                  <Line type="monotone" dataKey="percentage" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: "var(--color-primary)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {homeworkChartData.length > 0 && (
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>
                Homework Completion by Month
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={homeworkChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-hover)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="completed" fill="var(--color-success)" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="notCompleted" fill="rgba(239, 68, 68, 0.2)" name="Not Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === "remarks" && (
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "16px" }}>Teacher Remarks</h3>
          {isAdmin && (
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <textarea
                className="input"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Add a remark about this student..."
                rows={3}
                style={{ flex: 1, resize: "vertical" }}
              />
              <button
                onClick={addRemark}
                disabled={remarkLoading || !remarkText.trim()}
                className="btn-primary"
                style={{ alignSelf: "flex-start", opacity: !remarkText.trim() ? 0.5 : 1 }}
              >
                {remarkLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Add
              </button>
            </div>
          )}
          {student.remarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)" }}>No remarks yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {student.remarks.map((r) => (
                <div key={r.id} style={{ background: "var(--color-bg-app)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "14px 16px" }}>
                  <p style={{ color: "#374151", fontSize: "14px", lineHeight: 1.6, marginBottom: "8px" }}>{r.remark}</p>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    By {r.createdBy.name} &middot; {format(r.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
