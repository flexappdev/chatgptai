import { Skeleton } from "@/components/ui/Skeleton";

export default function SkillsLoading() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Skeleton height={28} width={120} style={{ marginBottom: 20 }} />
      <Skeleton height={48} style={{ marginBottom: 4 }} />
      <Skeleton height={48} style={{ marginBottom: 4 }} />
      <Skeleton height={48} style={{ marginBottom: 4 }} />
    </div>
  );
}
