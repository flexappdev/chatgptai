import { searchHistory } from "./actions";
import { HistoryList } from "@/components/history/HistoryList";

export default async function HistoryPage() {
  const initial = await searchHistory("", null);
  return <HistoryList initial={initial} />;
}
