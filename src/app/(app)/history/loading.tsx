import { Skeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Skeleton height={28} width={120} style={{ marginBottom: 16 }} />
      <Skeleton height={40} style={{ marginBottom: 16 }} />
      <div style={{ display: "grid", gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={72} radius={16} />
        ))}
      </div>
    </div>
  );
}
