// Tool executors for OpenRouter function-calling.
// Each executor takes a JSON arguments object and returns a JSON-serialisable result.

type Executor = (args: Record<string, unknown>) => Promise<Record<string, unknown>>;

const webSearch: Executor = async (args) => {
  const query = String(args.query ?? "").slice(0, 300);
  if (!query) return { error: "Missing query" };

  const key = process.env.BRAVE_API_KEY;
  if (!key) {
    return {
      demo: true,
      query,
      message:
        "Web search is in demo mode. Set BRAVE_API_KEY in the environment to enable live results.",
      results: [
        {
          title: `Demo result for "${query}"`,
          url: "https://example.com",
          snippet: "This is a placeholder web search result.",
        },
      ],
    };
  }

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": key,
      },
    });
    if (!res.ok) return { error: `Brave ${res.status}` };
    const json = (await res.json()) as {
      web?: { results?: { title?: string; url?: string; description?: string }[] };
    };
    const results = (json.web?.results ?? []).slice(0, 5).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    }));
    return { query, results };
  } catch (e) {
    return { error: (e as Error).message };
  }
};

const demoStub = (provider: string): Executor =>
  async (args) => ({
    demo: true,
    provider,
    args,
    message: `${provider} is a demo connector in chatgptai v1 — no live OAuth wired. The model should explain that this connector isn't connected yet.`,
  });

export const EXECUTORS: Record<string, Executor> = {
  web_search: webSearch,
  gmail_search: demoStub("gmail"),
  gdrive_search: demoStub("gdrive"),
  slack_search: demoStub("slack"),
  github_search: demoStub("github"),
};

export const TOOL_DEFINITIONS: Record<
  string,
  { type: "function"; function: { name: string; description: string; parameters: object } }
> = {
  web_search: {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Search the live web for up-to-date information. Returns up to 5 results.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query." },
        },
        required: ["query"],
      },
    },
  },
  gmail: {
    type: "function",
    function: {
      name: "gmail_search",
      description: "Search the user's Gmail inbox (demo mode).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  gdrive: {
    type: "function",
    function: {
      name: "gdrive_search",
      description: "Search the user's Google Drive (demo mode).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  slack: {
    type: "function",
    function: {
      name: "slack_search",
      description: "Search Slack messages (demo mode).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  github: {
    type: "function",
    function: {
      name: "github_search",
      description: "Look up GitHub repos / PRs / issues (demo mode).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
};

export function toolDefsFor(providers: string[]) {
  return providers
    .map((p) => TOOL_DEFINITIONS[p])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
}
