const statusConfig = {
  done: { bg: 'bg-status-done/15', text: 'text-status-done', border: 'border-status-done/30', label: 'Done' },
  pending: { bg: 'bg-status-pending/15', text: 'text-status-pending', border: 'border-status-pending/30', label: 'Pending' },
  processing: { bg: 'bg-status-processing/15', text: 'text-status-processing', border: 'border-status-processing/30', label: 'Processing' },
  failed: { bg: 'bg-status-failed/15', text: 'text-status-failed', border: 'border-status-failed/30', label: 'Failed' },
  active: { bg: 'bg-status-done/15', text: 'text-status-done', border: 'border-status-done/30', label: 'Active' },
  archived: { bg: 'bg-gray-500/15', text: 'text-gray-500', border: 'border-gray-500/30', label: 'Archived' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-sm ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.text} bg-current`} />
      {config.label}
    </span>
  );
}
