// OpenRouter client — single endpoint, picker chooses model per request.
// All fleet sites use the central OPENROUTER_API_KEY from ~/context-2026/agents/.env.

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ModelTier = "anthropic" | "openai" | "free";

export type ModelOption = {
  id: string;
  label: string;
  tier: ModelTier;
  description?: string;
};

// Default first (paid Anthropic). Per CLAUDE.md gotcha, never let a :free model
// occupy index 0 in any fallback chain.
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "anthropic/claude-sonnet-4-6",
    label: "Sonnet 4.6",
    tier: "anthropic",
    description: "Anthropic · fast & capable",
  },
  {
    id: "anthropic/claude-opus-4-7",
    label: "Opus 4.7",
    tier: "anthropic",
    description: "Anthropic · highest quality",
  },
  {
    id: "openai/gpt-5.1",
    label: "GPT-5.1",
    tier: "openai",
    description: "OpenAI · flagship",
  },
  {
    id: "openai/gpt-5.1-mini",
    label: "GPT-5.1 mini",
    tier: "openai",
    description: "OpenAI · cheaper & quicker",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B (free)",
    tier: "free",
    description: "Meta · free tier",
  },
  {
    id: "deepseek/deepseek-chat-v3.1:free",
    label: "DeepSeek v3.1 (free)",
    tier: "free",
    description: "DeepSeek · free tier",
  },
  {
    id: "google/gemma-3-27b-it:free",
    label: "Gemma 3 27B (free)",
    tier: "free",
    description: "Google · free tier",
  },
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0].id;
export const TITLE_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export function isValidModel(id: string): boolean {
  return MODEL_OPTIONS.some((m) => m.id === id);
}

export function openRouterHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.APP_URL ?? "http://localhost:17002",
    "X-Title": "chatgptai",
  };
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
