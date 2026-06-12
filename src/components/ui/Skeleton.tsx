export function Skeleton({
  height = 14,
  width = "100%",
  radius = 6,
  style,
}: {
  height?: number | string;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--surface) 0%, var(--bg) 50%, var(--surface) 100%)",
        backgroundSize: "200% 100%",
        animation: "chatgptai-shimmer 1.4s linear infinite",
        ...style,
      }}
    >
      <style>{`@keyframes chatgptai-shimmer {0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
