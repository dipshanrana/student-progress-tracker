"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, CheckCheck, X, Save, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CLASSES, SECTIONS, SUBJECTS } from "@/lib/constants";
import { format } from "../students/dateUtils";

interface HomeworkRecord {
  id: string;
  status: "COMPLETED" | "NOT_COMPLETED";
  student: { id: string; fullName: string; rollNumber: string };
}

interface Homework {
  id: string;
  title: string;
  subject: string;
  className: string;
  section: string;
  assignedDate: string;
  dueDate: string;
  description?: string | null;
  createdBy: { name: string };
  homeworkRecords: HomeworkRecord[];
  _count: { homeworkRecords: number };
}

export function HomeworkContent({ isAdmin }: { isAdmin: boolean }) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recordEdits, setRecordEdits] = useState<Record<string, "COMPLETED" | "NOT_COMPLETED">>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/homework");
    const json = await res.json();
    setHomeworks(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHomeworks(); }, [fetchHomeworks]);

  function toggleExpand(hw: Homework) {
    if (expandedId === hw.id) {
      setExpandedId(null);
    } else {
      setExpandedId(hw.id);
      // Initialize edits from existing records
      const edits: Record<string, "COMPLETED" | "NOT_COMPLETED"> = {};
      hw.homeworkRecords.forEach((r) => { edits[r.student.id] = r.status; });
      setRecordEdits(edits);
    }
  }

  function markAll(hw: Homework, status: "COMPLETED" | "NOT_COMPLETED") {
    const edits: Record<string, "COMPLETED" | "NOT_COMPLETED"> = {};
    hw.homeworkRecords.forEach((r) => { edits[r.student.id] = status; });
    setRecordEdits(edits);
  }

  async function saveRecords(hw: Homework) {
    setSaveLoading(true);
    const records = hw.homeworkRecords.map((r) => ({
      studentId: r.student.id,
      status: recordEdits[r.student.id] ?? r.status,
    }));
    const res = await fetch(`/api/homework/${hw.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    setSaveLoading(false);
    if (res.ok) {
      showToast("Records saved!", "success");
      fetchHomeworks();
    } else {
      showToast("Failed to save", "error");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/homework/${deleteId}`, { method: "DELETE" });
    setDeleteLoading(false);
    setDeleteId(null);
    if (res.ok) { showToast("Homework deleted", "success"); fetchHomeworks(); }
    else showToast("Failed to delete", "error");
  }

  const completionRate = (hw: Homework) => {
    if (!hw.homeworkRecords.length) return 0;
    const c = hw.homeworkRecords.filter((r) => r.status === "COMPLETED").length;
    return Math.round((c / hw.homeworkRecords.length) * 100);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
          Homework ({homeworks.length})
        </h2>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Homework
          </button>
        )}
      </div>

      {showCreate && isAdmin && (
        <CreateHomeworkModal
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); fetchHomeworks(); showToast("Homework created!", "success"); }}
        />
      )}

      {/* Homework List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : homeworks.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>ðŸ“š</div>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>No homework yet</h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {isAdmin ? "Create your first homework assignment." : "No homework has been assigned yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {homeworks.map((hw) => {
            const rate = completionRate(hw);
            const isExpanded = expandedId === hw.id;
            return (
              <div key={hw.id} className="card" style={{ overflow: "hidden" }}>
                {/* Header row */}
                <div
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", cursor: "pointer" }}
                  onClick={() => toggleExpand(hw)}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{hw.title}</h3>
                      <span style={{ background: "#ede9fe", color: "#4f46e5", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                        {hw.subject}
                      </span>
                      <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                        {hw.className}-{hw.section}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      Assigned: {format(hw.assignedDate)} Â· Due: {format(hw.dueDate)} Â· By {hw.createdBy.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: rate >= 70 ? "#10b981" : rate >= 40 ? "#f59e0b" : "#ef4444" }}>
                        {rate}%
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Completion</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: "#374151" }}>
                        {hw.homeworkRecords.filter((r) => r.status === "COMPLETED").length}/{hw.homeworkRecords.length}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Students</div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(hw.id); }}
                        style={{ background: "#fee2e2", border: "none", color: "#dc2626", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: "4px", background: "#f1f5f9" }}>
                  <div style={{ height: "100%", width: `${rate}%`, background: rate >= 70 ? "#10b981" : rate >= 40 ? "#f59e0b" : "#ef4444", transition: "width 0.4s" }} />
                </div>

                {/* Expanded student records */}
                {isExpanded && hw.homeworkRecords.length > 0 && (
                  <div style={{ borderTop: "1px solid #f1f5f9" }}>
                    {isAdmin && (
                      <div style={{ padding: "12px 20px", background: "#f8fafc", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <button
                          onClick={() => markAll(hw, "COMPLETED")}
                          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: "6px", color: "#065f46", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                        >
                          <CheckCheck size={14} /> Mark All Completed
                        </button>
                        <button
                          onClick={() => markAll(hw, "NOT_COMPLETED")}
                          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                        >
                          <X size={14} /> Mark All Not Completed
                        </button>
                        <button
                          onClick={() => saveRecords(hw)}
                          disabled={saveLoading}
                          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#4f46e5", border: "none", borderRadius: "6px", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}
                        >
                          {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save Changes
                        </button>
                      </div>
                    )}
                    <table>
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Student</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hw.homeworkRecords
                          .sort((a, b) => a.student.rollNumber.localeCompare(b.student.rollNumber))
                          .map((r) => {
                            const status = recordEdits[r.student.id] ?? r.status;
                            return (
                              <tr key={r.id}>
                                <td style={{ fontWeight: 600, color: "#4f46e5" }}>#{r.student.rollNumber}</td>
                                <td style={{ fontWeight: 600 }}>{r.student.fullName}</td>
                                <td>
                                  {isAdmin ? (
                                    <button
                                      onClick={() => setRecordEdits((prev) => ({
                                        ...prev,
                                        [r.student.id]: status === "COMPLETED" ? "NOT_COMPLETED" : "COMPLETED",
                                      }))}
                                      style={{
                                        padding: "5px 14px",
                                        borderRadius: "20px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: status === "COMPLETED" ? "#d1fae5" : "#fee2e2",
                                        color: status === "COMPLETED" ? "#065f46" : "#991b1b",
                                      }}
                                    >
                                      {status === "COMPLETED" ? "âœ“ Completed" : "âœ— Not Completed"}
                                    </button>
                                  ) : (
                                    <span style={{
                                      padding: "3px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      background: r.status === "COMPLETED" ? "#d1fae5" : "#fee2e2",
                                      color: r.status === "COMPLETED" ? "#065f46" : "#991b1b",
                                    }}>
                                      {r.status === "COMPLETED" ? "âœ“ Completed" : "âœ— Not Completed"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Homework"
          message="Are you sure you want to delete this homework? All completion records will also be deleted."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}

// Create Homework Modal
function CreateHomeworkModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "", subject: "", description: "", className: "", section: "A",
    assignedDate: today, dueDate: today,
  });

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) onSave();
    else setError(json.error || "Failed to create");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Create Homework</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px", marginBottom: "14px", color: "#991b1b", fontSize: "14px" }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Title *</label>
              <input className="input" required value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Chapter 3 Exercises" />
            </div>
            <div>
              <label className="label">Subject *</label>
              <select className="input" required value={form.subject} onChange={(e) => handleChange("subject", e.target.value)}>
                <option value="">Select Subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Class *</label>
              <select className="input" required value={form.className} onChange={(e) => handleChange("className", e.target.value)}>
                <option value="">Select Class</option>
                {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Section *</label>
              <select className="input" value={form.section} onChange={(e) => handleChange("section", e.target.value)}>
                {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned Date *</label>
              <input className="input" type="date" required value={form.assignedDate} onChange={(e) => handleChange("assignedDate", e.target.value)} />
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input className="input" type="date" required value={form.dueDate} min={form.assignedDate} onChange={(e) => handleChange("dueDate", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <textarea className="input" value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={2} style={{ resize: "vertical" }} placeholder="Instructions for students..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Plus size={16} /> Create Homework</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
