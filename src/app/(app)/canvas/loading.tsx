import { Skeleton } from "@/components/ui/Skeleton";

export default function CanvasLoading() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <Skeleton height={28} width={120} style={{ marginBottom: 20 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={110} radius={16} />
        ))}
      </div>
    </div>
  );
}
