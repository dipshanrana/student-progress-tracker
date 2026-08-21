export function Skeleton({ width = "100%", height = "20px", className = "" }: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: "6px",
        background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <Skeleton height="16px" width="60%" />
      <div style={{ marginTop: "12px" }}>
        <Skeleton height="32px" width="40%" />
      </div>
      <div style={{ marginTop: "8px" }}>
        <Skeleton height="12px" width="80%" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "16px",
            padding: "14px 16px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Skeleton width="40px" height="14px" />
          <Skeleton width="160px" height="14px" />
          <Skeleton width="60px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="100px" height="14px" />
        </div>
      ))}
    </div>
  );
}
