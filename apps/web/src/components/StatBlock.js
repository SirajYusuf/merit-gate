export default function StatBlock({ value, label, trend }) {
  return (
    <div className="flex flex-col">
      <div className="text-7xl md:text-8xl font-black tracking-tighter text-rose mb-4">
        {value}
      </div>
      <div className="text-xl font-bold uppercase tracking-widest mb-2 border-b border-teal-muted pb-4">
        {label}
      </div>
      <div className="text-teal-muted font-medium">
        {trend}
      </div>
    </div>
  );
}
