export default function EmbeddingProgress({ memories }) {
  if (!memories) return null;

  const { done = 0, processing = 0, pending = 0, failed = 0, total = 0 } = memories;
  if (total === 0) return null;

  const segments = [
    { count: done, color: 'bg-status-done', label: 'Done' },
    { count: processing, color: 'bg-status-processing', label: 'Processing' },
    { count: pending, color: 'bg-status-pending', label: 'Pending' },
    { count: failed, color: 'bg-status-failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden bg-deep-teal/10 rounded-sm">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.label}
              className={`${seg.color} transition-all duration-500`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <span className={`w-2 h-2 rounded-full ${seg.color}`} />
            {seg.label}: {seg.count}
          </div>
        ))}
      </div>
    </div>
  );
}
