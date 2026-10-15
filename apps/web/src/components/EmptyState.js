export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-8">
      {Icon && <Icon size={64} className="text-teal-muted/30 mb-8" />}
      <h3 className="text-3xl font-black uppercase tracking-tight text-text-primary mb-4">
        {title}
      </h3>
      <p className="text-xl text-text-body max-w-md mb-8">
        {description}
      </p>
      {action}
    </div>
  );
}
