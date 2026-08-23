"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  UserPlus, Search, SlidersHorizontal, Pencil, Trash2, Eye,
  ChevronUp, ChevronDown, X,
} from "lucide-react";
import { PerformanceBadge, ScoreBar } from "@/components/ui/PerformanceBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Toast, useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StudentModal } from "./StudentModal";
import { CLASSES, SECTIONS } from "@/lib/constants";
import {
  calculateStudentTestAverage,
  calculateHomeworkCompletion,
  calculateOverallPerformance,
  getPerformanceStatus,
} from "@/lib/analytics";
import type { PerformanceStatus } from "@/lib/constants";

interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  gender?: string | null;
  testResults: { obtainedMarks: number; test: { fullMarks: number } }[];
  homeworkRecords: { status: string }[];
}

interface StudentWithStats extends Student {
  testAverage: number;
  homeworkCompletion: number;
  overallScore: number;
  status: PerformanceStatus;
}

function StudentInitials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : name.slice(0, 2);
  return (
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: "13px", fontWeight: 700,
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

export function StudentsContent({ isAdmin }: { isAdmin: boolean }) {
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [perfFilter, setPerfFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof StudentWithStats>("rollNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (classFilter) params.set("className", classFilter);
    if (sectionFilter) params.set("section", sectionFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/students?${params}`);
    const json = await res.json();
    const withStats = (json.data || []).map((s: Student) => {
      const testAverage = calculateStudentTestAverage(s.testResults);
      const homeworkCompletion = calculateHomeworkCompletion(s.homeworkRecords);
      const overallScore = calculateOverallPerformance(testAverage, homeworkCompletion);
      return { ...s, testAverage, homeworkCompletion, overallScore, status: getPerformanceStatus(overallScore) };
    });
    setStudents(withStats);
    setLoading(false);
  }, [classFilter, sectionFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleSort = (key: keyof StudentWithStats) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = students
    .filter((s) => !perfFilter || s.status === perfFilter)
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const dir = sortDir === "asc" ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

  const hasActiveFilters = classFilter || sectionFilter || perfFilter || search;

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/students/${deleteId}`, { method: "DELETE" });
    setDeleteLoading(false);
    setDeleteId(null);
    if (res.ok) {
      showToast("Student deleted successfully", "success");
      fetchStudents();
    } else {
      showToast("Failed to delete student", "error");
    }
  }

  function SortIcon({ field }: { field: keyof StudentWithStats }) {
    if (sortKey !== field) return null;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-dark)" }}>
            All Students
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-muted)", marginLeft: "8px" }}>
              ({filtered.length})
            </span>
          </h2>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditStudent(null); setShowModal(true); }}>
            <UserPlus size={16} /> Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        background: "white", border: "1px solid var(--color-border)", borderRadius: "12px",
        padding: "12px 14px", marginBottom: "16px",
      }}>
        {/* Search row */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            className="input"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "34px" }}
          />
        </div>
        {/* Filter selects */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "13px" }}>
            <SlidersHorizontal size={15} />
            <span>Filters:</span>
          </div>
          <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ width: "auto", minWidth: "110px", fontSize: "13px", padding: "7px 10px" }}>
            <option value="">All Classes</option>
            {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select className="input" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ width: "auto", minWidth: "110px", fontSize: "13px", padding: "7px 10px" }}>
            <option value="">All Sections</option>
            {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
          <select className="input" value={perfFilter} onChange={(e) => setPerfFilter(e.target.value)} style={{ width: "auto", minWidth: "150px", fontSize: "13px", padding: "7px 10px" }}>
            <option value="">All Performance</option>
            {["Excellent", "Very Good", "Good", "Average", "Needs Improvement", "At Risk"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(""); setClassFilter(""); setSectionFilter(""); setPerfFilter(""); }}
              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 10px", background: "none", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px", color: "var(--color-text-muted)", cursor: "pointer" }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table container — horizontally scrollable */}
      <div className="table-container" style={{ background: "white" }}>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px", color: "var(--color-border)" }}>&#128269;</div>
            <h3 style={{ fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "6px" }}>No students found</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
              {hasActiveFilters ? "Try adjusting your filters or search term." : isAdmin ? "Add your first student to start tracking progress." : "No students available."}
            </p>
          </div>
        ) : (
          <table style={{ minWidth: "700px" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("rollNumber")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Roll No <SortIcon field="rollNumber" /></div>
                </th>
                <th onClick={() => handleSort("fullName")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Student <SortIcon field="fullName" /></div>
                </th>
                <th>Class</th>
                <th onClick={() => handleSort("homeworkCompletion")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Homework % <SortIcon field="homeworkCompletion" /></div>
                </th>
                <th onClick={() => handleSort("testAverage")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Test Avg <SortIcon field="testAverage" /></div>
                </th>
                <th onClick={() => handleSort("overallScore")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Overall <SortIcon field="overallScore" /></div>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>#{s.rollNumber}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <StudentInitials name={s.fullName} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-text-dark)", whiteSpace: "nowrap" }}>{s.fullName}</div>
                        {s.gender && <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.gender}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: "rgba(109,40,217,0.1)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {s.className}-{s.section}
                    </span>
                  </td>
                  <td style={{ minWidth: "130px" }}>
                    {s.homeworkRecords.length === 0 ? (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>No data</span>
                    ) : (
                      <ScoreBar score={s.homeworkCompletion} />
                    )}
                  </td>
                  <td style={{ minWidth: "120px" }}>
                    {s.testResults.length === 0 ? (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>No data</span>
                    ) : (
                      <ScoreBar score={s.testAverage} />
                    )}
                  </td>
                  <td style={{ minWidth: "120px" }}>
                    <ScoreBar score={s.overallScore} />
                  </td>
                  <td>
                    <PerformanceBadge status={s.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "nowrap" }}>
                      <Link
                        href={`/students/${s.id}`}
                        style={{ display: "inline-flex", alignItems: "center", padding: "5px 9px", background: "var(--color-bg-app)", border: "1px solid var(--color-border)", borderRadius: "6px", color: "#374151", fontSize: "13px", fontWeight: 500, gap: "4px", textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        <Eye size={14} /> View
                      </Link>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => { setEditStudent(s); setShowModal(true); }}
                            style={{ display: "inline-flex", alignItems: "center", padding: "5px 9px", background: "rgba(109,40,217,0.1)", border: "1px solid #ddd6fe", borderRadius: "6px", color: "var(--color-primary)", fontSize: "13px", fontWeight: 500, gap: "4px", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(s.id)}
                            style={{ display: "inline-flex", alignItems: "center", padding: "5px 8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", color: "var(--color-danger)", fontSize: "13px", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <StudentModal
          student={editStudent}
          onClose={() => { setShowModal(false); setEditStudent(null); }}
          onSave={() => { setShowModal(false); setEditStudent(null); fetchStudents(); showToast(editStudent ? "Student updated!" : "Student added!", "success"); }}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Student"
          message="Are you sure you want to delete this student? All associated homework records, test results, and remarks will also be deleted. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
