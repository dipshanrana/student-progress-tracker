"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Save, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CLASSES, SECTIONS, SUBJECTS } from "@/lib/constants";
import { calculatePercentage } from "@/lib/analytics";
import { format } from "../students/dateUtils";
import { ScoreBar } from "@/components/ui/PerformanceBadge";

interface TestResult {
  id: string;
  obtainedMarks: number;
  student: { id: string; fullName: string; rollNumber: string };
}

interface Test {
  id: string;
  name: string;
  subject: string;
  className: string;
  section: string;
  testDate: string;
  fullMarks: number;
  description?: string | null;
  createdBy: { name: string };
  testResults: TestResult[];
  _count: { testResults: number };
}

export function TestsContent({ isAdmin }: { isAdmin: boolean }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [marksEdits, setMarksEdits] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchTests = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tests");
    const json = await res.json();
    setTests(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  async function fetchTestDetails(id: string) {
    const res = await fetch(`/api/tests/${id}`);
    const json = await res.json();
    return json.data as Test;
  }

  async function toggleExpand(test: Test) {
    if (expandedId === test.id) {
      setExpandedId(null);
      return;
    }
    // Fetch students for this class
    const studentRes = await fetch(`/api/students?className=${test.className}&section=${test.section}`);
    const studentJson = await studentRes.json();
    const students = studentJson.data || [];

    // Fetch test details with existing results
    const detail = await fetchTestDetails(test.id);
    const resultMap: Record<string, number> = {};
    detail.testResults.forEach((r: TestResult) => { resultMap[r.student.id] = r.obtainedMarks; });

    // Build edits - include all students
    const edits: Record<string, string> = {};
    students.forEach((s: { id: string }) => {
      edits[s.id] = resultMap[s.id] !== undefined ? String(resultMap[s.id]) : "";
    });
    setMarksEdits(edits);

    // Update test with student list
    setTests((prev) => prev.map((t) => t.id === test.id ? { ...t, _students: students } as typeof t & { _students: typeof students } : t));
    setExpandedId(test.id);
  }

  async function saveResults(test: Test) {
    const results = Object.entries(marksEdits)
      .filter(([, v]) => v !== "")
      .map(([studentId, v]) => ({
        studentId,
        obtainedMarks: parseFloat(v),
      }));

    const invalid = results.find((r) => r.obtainedMarks > test.fullMarks || r.obtainedMarks < 0);
    if (invalid) {
      showToast(`Marks must be between 0 and ${test.fullMarks}`, "error");
      return;
    }

    setSaveLoading(true);
    const res = await fetch(`/api/tests/${test.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results, fullMarks: test.fullMarks }),
    });
    setSaveLoading(false);
    if (res.ok) { showToast("Results saved!", "success"); fetchTests(); }
    else showToast("Failed to save results", "error");
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/tests/${deleteId}`, { method: "DELETE" });
    setDeleteLoading(false);
    setDeleteId(null);
    if (res.ok) { showToast("Test deleted", "success"); fetchTests(); }
    else showToast("Failed to delete", "error");
  }

  function classAverage(test: Test) {
    if (!test.testResults.length) return null;
    const sum = test.testResults.reduce((a, r) => a + calculatePercentage(r.obtainedMarks, test.fullMarks), 0);
    return (sum / test.testResults.length).toFixed(1);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-dark)" }}>Tests ({tests.length})</h2>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Test
          </button>
        )}
      </div>

      {showCreate && isAdmin && (
        <CreateTestModal
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); fetchTests(); showToast("Test created!", "success"); }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--color-text-muted)" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : tests.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📝</div>
          <h3 style={{ fontWeight: 700, color: "var(--color-text-dark)", marginBottom: "6px" }}>No tests yet</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            {isAdmin ? "Create your first test." : "No tests have been created yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tests.map((test) => {
            const avg = classAverage(test);
            const isExpanded = expandedId === test.id;
            const extTest = test as typeof test & { _students?: Array<{ id: string; fullName: string; rollNumber: string }> };
            const students = extTest._students || [];
            return (
              <div key={test.id} className="card" style={{ overflow: "hidden" }}>
                <div
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", flexWrap: "wrap" }}
                  onClick={() => toggleExpand(test)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-dark)" }}>{test.name}</h3>
                      <span style={{ background: "rgba(109, 40, 217, 0.1)", color: "var(--color-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{test.subject}</span>
                      <span style={{ background: "var(--color-surface-hover)", color: "var(--color-text-muted)", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{test.className}-{test.section}</span>
                      <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--color-warning)", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>Full Marks: {test.fullMarks}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                      {format(test.testDate)} &middot; By {test.createdBy.name}
                      {test.description && ` \u00b7 ${test.description}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {avg && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-primary)" }}>{avg}%</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Class Avg</div>
                      </div>
                    )}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>{test.testResults.length}</div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Results</div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(test.id); }}
                        style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--color-danger)", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--color-surface-hover)" }}>
                    {isAdmin && students.length > 0 && (
                      <div style={{ padding: "12px 20px", background: "var(--color-bg-app)", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => saveResults(test)}
                          disabled={saveLoading}
                          className="btn-primary"
                        >
                          {saveLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Results</>}
                        </button>
                      </div>
                    )}
                    {students.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
                        No students found for Class {test.className}-{test.section}
                      </div>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Roll No</th>
                            <th>Student</th>
                            <th>Obtained Marks</th>
                            <th>Full Marks</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students
                            .sort((a: { rollNumber: string }, b: { rollNumber: string }) => a.rollNumber.localeCompare(b.rollNumber))
                            .map((s: { id: string; fullName: string; rollNumber: string }) => {
                              const marks = marksEdits[s.id];
                              const pct = marks !== "" && marks !== undefined
                                ? calculatePercentage(parseFloat(marks), test.fullMarks)
                                : null;
                              return (
                                <tr key={s.id}>
                                  <td style={{ fontWeight: 600, color: "var(--color-primary)" }}>#{s.rollNumber}</td>
                                  <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                                  <td>
                                    {isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max={test.fullMarks}
                                        value={marksEdits[s.id] ?? ""}
                                        onChange={(e) => setMarksEdits((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                        style={{ width: "80px", padding: "4px 8px", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                                        placeholder="-"
                                      />
                                    ) : (
                                      <span style={{ fontWeight: 600 }}>{marksEdits[s.id] ?? "-"}</span>
                                    )}
                                  </td>
                                  <td style={{ color: "var(--color-text-muted)" }}>{test.fullMarks}</td>
                                  <td style={{ minWidth: "150px" }}>
                                    {pct !== null ? <ScoreBar score={pct} /> : <span style={{ color: "#94a3b8" }}>-</span>}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Test"
          message="Are you sure? All test results will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}

function CreateTestModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: "", subject: "", className: "", section: "A",
    testDate: today, fullMarks: "100", description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fullMarks: parseInt(form.fullMarks) }),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) onSave();
    else setError(json.error || "Failed to create");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--color-surface-hover)" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-text-dark)" }}>Create Test</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "10px", marginBottom: "14px", color: "#991b1b", fontSize: "14px" }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Test Name *</label>
              <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Unit Test 1" />
            </div>
            <div>
              <label className="label">Subject *</label>
              <select className="input" required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                <option value="">Select Subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Full Marks *</label>
              <input className="input" type="number" min="1" required value={form.fullMarks} onChange={(e) => setForm((f) => ({ ...f, fullMarks: e.target.value }))} />
            </div>
            <div>
              <label className="label">Class *</label>
              <select className="input" required value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}>
                <option value="">Select Class</option>
                {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Section *</label>
              <select className="input" value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}>
                {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Test Date *</label>
              <input className="input" type="date" required value={form.testDate} onChange={(e) => setForm((f) => ({ ...f, testDate: e.target.value }))} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <textarea className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} style={{ resize: "vertical" }} placeholder="Chapters covered..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--color-surface-hover)" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Test</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
