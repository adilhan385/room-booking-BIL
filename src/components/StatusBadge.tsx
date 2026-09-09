const VARIANTS: Record<string, string> = {
  PENDING: "badge-pending",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
};

const LABELS: Record<string, string> = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
  CANCELLED: "Отменено",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${VARIANTS[status] || "badge-cancelled"}`}>
      <span className="badge-dot" />
      {LABELS[status] || status}
    </span>
  );
}
