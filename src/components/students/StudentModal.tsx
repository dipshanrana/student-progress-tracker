"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { CLASSES, SECTIONS } from "@/lib/constants";

interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  className: string;
  section: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  address?: string | null;
  admissionDate?: string | null;
  notes?: string | null;
}

interface StudentModalProps {
  student: Partial<Student> | null;
  onClose: () => void;
  onSave: () => void;
}

export function StudentModal({ student, onClose, onSave }: StudentModalProps) {
  const isEdit = !!student?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: student?.fullName ?? "",
    rollNumber: student?.rollNumber ?? "",
    className: student?.className ?? "",
    section: student?.section ?? "A",
    gender: student?.gender ?? "",
    dateOfBirth: student?.dateOfBirth ? String(student.dateOfBirth).split("T")[0] : "",
    guardianName: student?.guardianName ?? "",
    guardianPhone: student?.guardianPhone ?? "",
    address: student?.address ?? "",
    admissionDate: student?.admissionDate ? String(student.admissionDate).split("T")[0] : "",
    notes: student?.notes ?? "",
  });

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/students/${student!.id}` : "/api/students";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setLoading(false);

    if (res.ok) {
      onSave();
    } else {
      setError(json.error || "Failed to save student");
    }
  }

  const fields: { label: string; field: string; type?: string; required?: boolean; options?: string[] }[] = [
    { label: "Full Name *", field: "fullName", required: true },
    { label: "Roll Number *", field: "rollNumber", required: true },
    { label: "Class *", field: "className", required: true, options: CLASSES },
    { label: "Section", field: "section", options: SECTIONS },
    { label: "Gender", field: "gender", options: ["", "Male", "Female", "Other"] },
    { label: "Date of Birth", field: "dateOfBirth", type: "date" },
    { label: "Guardian Name", field: "guardianName" },
    { label: "Guardian Phone", field: "guardianPhone" },
    { label: "Address", field: "address" },
    { label: "Admission Date", field: "admissionDate", type: "date" },
    { label: "Notes", field: "notes" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-surface-hover)",
          }}
        >
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-text-dark)" }}>
            {isEdit ? "Edit Student" : "Add New Student"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#991b1b", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {fields.map(({ label, field, type = "text", required, options }) => (
              <div key={field} style={field === "address" || field === "notes" ? { gridColumn: "1 / -1" } : {}}>
                <label className="label">{label}</label>
                {options ? (
                  <select
                    className="input"
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={required}
                  >
                    {field === "className" && <option value="">Select Class</option>}
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {field === "className" ? `Class ${o}` : field === "section" ? `Section ${o}` : o || "Select gender"}
                      </option>
                    ))}
                  </select>
                ) : field === "notes" || field === "address" ? (
                  <textarea
                    className="input"
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                ) : (
                  <input
                    className="input"
                    type={type}
                    value={(form as Record<string, string>)[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={required}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--color-surface-hover)" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
