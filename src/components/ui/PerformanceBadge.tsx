import type { PerformanceStatus } from "@/lib/constants";

const statusConfig: Record<
  PerformanceStatus,
  { bg: string; color: string; dot: string }
> = {
  Excellent: { bg: "rgba(16, 185, 129, 0.15)", color: "#065f46", dot: "var(--color-success)" },
  "Very Good": { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  Good: { bg: "rgba(109, 40, 217, 0.1)", color: "#4c1d95", dot: "#8b5cf6" },
  Average: { bg: "rgba(245, 158, 11, 0.15)", color: "var(--color-warning)", dot: "var(--color-warning)" },
  "Needs Improvement": { bg: "rgba(239, 68, 68, 0.1)", color: "#991b1b", dot: "var(--color-danger)" },
  "At Risk": { bg: "#ffe4e6", color: "#881337", dot: "#f43f5e" },
};

export function PerformanceBadge({ status }: { status: PerformanceStatus }) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return "var(--color-success)";
    if (s >= 80) return "#3b82f6";
    if (s >= 70) return "#8b5cf6";
    if (s >= 60) return "var(--color-warning)";
    if (s >= 50) return "var(--color-danger)";
    return "#f43f5e";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "6px",
          borderRadius: "3px",
          background: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(score, 100)}%`,
            borderRadius: "3px",
            background: getColor(score),
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151", minWidth: "40px" }}>
        {score.toFixed(0)}%
      </span>
    </div>
  );
}
