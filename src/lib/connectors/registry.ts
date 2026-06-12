export type ConnectorProvider =
  | "web_search"
  | "gmail"
  | "gdrive"
  | "slack"
  | "github";

export type ConnectorDef = {
  provider: ConnectorProvider;
  label: string;
  icon: string;
  description: string;
  real: boolean; // true if the executor hits a live service
};

export const CONNECTOR_REGISTRY: ConnectorDef[] = [
  {
    provider: "web_search",
    label: "Web Search",
    icon: "🔎",
    description:
      "Search the live web via Brave Search and feed grounded results back into the chat. Demo mode if BRAVE_API_KEY is missing.",
    real: true,
  },
  {
    provider: "gmail",
    label: "Gmail",
    icon: "✉️",
    description: "Find and summarise email threads. Demo connector — no live OAuth yet.",
    real: false,
  },
  {
    provider: "gdrive",
    label: "Google Drive",
    icon: "📂",
    description: "Search and ground answers in your Drive documents. Demo connector.",
    real: false,
  },
  {
    provider: "slack",
    label: "Slack",
    icon: "💬",
    description: "Search messages across workspaces. Demo connector.",
    real: false,
  },
  {
    provider: "github",
    label: "GitHub",
    icon: "🐙",
    description: "Look up repos, PRs, issues. Demo connector.",
    real: false,
  },
];

export function getConnectorDef(provider: string): ConnectorDef | undefined {
  return CONNECTOR_REGISTRY.find((c) => c.provider === provider);
}
