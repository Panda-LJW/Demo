export default function StatusChip({ status }) {
  const map = {
    available: ['badge-available', '可借'],
    borrowed: ['badge-borrowed', '借阅中'],
    returned: ['badge-returned', '已归还'],
    overdue: ['badge-overdue', '逾期'],
  };
  const [className, label] = map[status] || map.available;
  return (
    <span className={`badge ${className}`}>
      {label}
    </span>
  );
}
