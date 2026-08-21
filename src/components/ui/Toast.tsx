"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        maxWidth: "380px",
        animation: "slideIn 0.3s ease",
        background: type === "success" ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
        color: type === "success" ? "#166534" : "#991b1b",
      }}
    >
      {type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
      <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  function hideToast() {
    setToast(null);
  }

  return { toast, showToast, hideToast };
}
