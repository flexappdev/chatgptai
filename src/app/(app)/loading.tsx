import { Skeleton } from "@/components/ui/Skeleton";

export default function AppLoading() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
      }}
    >
      <Skeleton width={280} height={28} />
      <Skeleton width={560} height={20} />
      <Skeleton width={420} height={20} />
    </div>
  );
}
