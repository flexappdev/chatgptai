import type { ChatRow } from "@/lib/database.types";

export type Bucket =
  | "Starred"
  | "Today"
  | "Yesterday"
  | "Previous 7 days"
  | "Previous 30 days"
  | "Older";

const BUCKET_ORDER: Bucket[] = [
  "Starred",
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Older",
];

function bucketFor(chat: ChatRow, now: Date): Bucket {
  if (chat.starred) return "Starred";
  const ts = new Date(chat.last_message_at).getTime();
  const diffMs = now.getTime() - ts;
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday.getTime() - day);
  if (ts >= startOfToday.getTime()) return "Today";
  if (ts >= startOfYesterday.getTime()) return "Yesterday";
  if (diffMs < 7 * day) return "Previous 7 days";
  if (diffMs < 30 * day) return "Previous 30 days";
  return "Older";
}

export function groupByBucket(chats: ChatRow[], now = new Date()) {
  const buckets = new Map<Bucket, ChatRow[]>();
  for (const c of chats) {
    const b = bucketFor(c, now);
    const arr = buckets.get(b) ?? [];
    arr.push(c);
    buckets.set(b, arr);
  }
  return BUCKET_ORDER.flatMap((label) => {
    const arr = buckets.get(label);
    if (!arr || arr.length === 0) return [];
    return [{ label, chats: arr }];
  });
}
