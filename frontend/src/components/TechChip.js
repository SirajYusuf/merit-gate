export default function TechChip({ label }) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-widest border border-teal-muted/40 text-teal-muted rounded-sm">
      {label}
    </span>
  );
}
