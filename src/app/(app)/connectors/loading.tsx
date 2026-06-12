import { Skeleton } from "@/components/ui/Skeleton";

export default function ConnectorsLoading() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Skeleton height={28} width={160} style={{ marginBottom: 24 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={140} radius={16} />
        ))}
      </div>
    </div>
  );
}
