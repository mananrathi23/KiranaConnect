export default function StatusBadge({ status }) {
  const map = {
    PENDING:    { cls: 'badge-pending',    label: '⏳ Pending' },
    BATCHED:    { cls: 'badge-batched',    label: '📦 Batched' },
    DISPATCHED: { cls: 'badge-dispatched', label: '✅ Dispatched' },
    CANCELLED:  { cls: 'badge-cancelled',  label: '❌ Cancelled' },
    CREATED:    { cls: 'badge-blue',       label: '🔵 Created' },
  };
  const { cls, label } = map[status] || { cls: 'badge-blue', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}
