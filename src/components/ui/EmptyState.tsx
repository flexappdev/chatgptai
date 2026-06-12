export function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon?: string;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 48,
        textAlign: "center",
        color: "var(--text-muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {icon && <span style={{ fontSize: 36 }}>{icon}</span>}
      <div style={{ color: "var(--text)", fontSize: 15, fontWeight: 500 }}>{title}</div>
      {description && (
        <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
          {description}
        </p>
      )}
      {cta && <div style={{ marginTop: 8 }}>{cta}</div>}
    </div>
  );
}
