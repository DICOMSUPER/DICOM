function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`text-sm font-medium text-slate-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default InfoItem;