import type { PerformanceStatus } from "@/lib/constants";

const statusConfig: Record<
  PerformanceStatus,
  { bg: string; color: string; dot: string }
> = {
  Excellent: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  "Very Good": { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  Good: { bg: "#ede9fe", color: "#4c1d95", dot: "#8b5cf6" },
  Average: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  "Needs Improvement": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
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
    if (s >= 90) return "#10b981";
    if (s >= 80) return "#3b82f6";
    if (s >= 70) return "#8b5cf6";
    if (s >= 60) return "#f59e0b";
    if (s >= 50) return "#ef4444";
    return "#f43f5e";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "6px",
          borderRadius: "3px",
          background: "#e2e8f0",
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
