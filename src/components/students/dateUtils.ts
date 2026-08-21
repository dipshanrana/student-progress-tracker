// Simple date formatting utility to avoid date-fns dependency
export function format(dateStr: string | Date, fmt = "MMM d, yyyy"): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return fmt
    .replace("yyyy", String(d.getFullYear()))
    .replace("MMM", months[d.getMonth()])
    .replace("MM", String(d.getMonth() + 1).padStart(2, "0"))
    .replace("d", String(d.getDate()))
    .replace("dd", String(d.getDate()).padStart(2, "0"));
}
