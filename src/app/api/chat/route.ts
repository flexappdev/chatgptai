import { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  OPENROUTER_URL,
  openRouterHeaders,
  DEFAULT_MODEL,
  TITLE_MODEL,
  isValidModel,
  type ChatMessage,
} from "@/lib/openrouter";
import { BASE_SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "edge";

type CookieSet = { name: string; value: string; options?: CookieOptions };

type PostBody = {
  chatId: string | null;
  projectId?: string;
  message: string;
  model?: string;
  skillSlug?: string;
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet: CookieSet[]) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            /* SSE response — cookie writes happen via middleware. */
          }
        },
      },
    },
  );
}

function sse(event: object): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (!body.message?.trim()) {
    return new Response("Empty message", { status: 400 });
  }

  const model = body.model && isValidModel(body.model) ? body.model : DEFAULT_MODEL;

  // Resolve / create chat
  let chatId = body.chatId;
  let createdNewChat = false;
  if (!chatId) {
    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        project_id: body.projectId ?? null,
        title: "New chat",
        model,
      })
      .select("id")
      .single();
    if (error || !chat) {
      return new Response("Failed to create chat", { status: 500 });
    }
    chatId = chat.id as string;
    createdNewChat = true;
  }

  // Load prior messages (cap last 40)
  const { data: priorRaw } = await supabase
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(40);
  const prior = (priorRaw ?? []) as { role: "user" | "assistant"; content: string }[];

  // Project context
  let projectInstructions = "";
  let projectMemories = "";
  let projectFiles = "";
  const { data: chatRow } = await supabase
    .from("chats")
    .select("project_id, model")
    .eq("id", chatId)
    .maybeSingle();
  const projectId = (chatRow?.project_id as string | null) ?? null;
  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("instructions, memory_enabled")
      .eq("id", projectId)
      .maybeSingle();
    if (project?.instructions) projectInstructions = project.instructions as string;
    if (project?.memory_enabled) {
      const { data: mems } = await supabase
        .from("project_memories")
        .select("content")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(20);
      projectMemories = (mems ?? [])
        .map((m: { content: string }) => `- ${m.content}`)
        .join("\n");
    }
    const { data: files } = await supabase
      .from("project_files")
      .select("filename, extracted_text")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    let budget = 60000;
    const chunks: string[] = [];
    for (const f of (files ?? []) as { filename: string; extracted_text: string | null }[]) {
      if (!f.extracted_text) continue;
      const remaining = Math.max(0, budget);
      if (remaining <= 0) break;
      const slice = f.extracted_text.slice(0, remaining);
      chunks.push(`### ${f.filename}\n${slice}`);
      budget -= slice.length;
    }
    if (chunks.length > 0) {
      projectFiles = chunks.join("\n\n");
    }
  }

  // Skill block
  let skillBlock = "";
  if (body.skillSlug) {
    const { data: skill } = await supabase
      .from("skills")
      .select("name, content, enabled")
      .eq("slug", body.skillSlug)
      .maybeSingle();
    if (skill && (skill as { enabled: boolean }).enabled) {
      const content = ((skill as { content: string }).content ?? "").slice(0, 16000);
      const name = (skill as { name: string }).name;
      skillBlock = `\n\n## Active skill: ${name}\n${content}\nFollow this skill's instructions for this response.`;
    }
  }

  let system = BASE_SYSTEM_PROMPT;
  if (projectInstructions) {
    system += `\n\n## Project instructions\n${projectInstructions}`;
  }
  if (projectFiles) {
    system += `\n\n## Project knowledge (excerpts, newest first; some files may be truncated)\n${projectFiles}`;
  }
  if (projectMemories) {
    system += `\n\n## Project memories (recent)\n${projectMemories}`;
  }
  system += skillBlock;

  // Persist the user message
  const userContent = body.skillSlug ? `/${body.skillSlug} ${body.message}` : body.message;
  const { data: userMsg } = await supabase
    .from("messages")
    .insert({
      user_id: user.id,
      chat_id: chatId,
      role: "user",
      content: userContent,
    })
    .select("id")
    .single();

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...prior.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    { role: "user", content: userContent },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(sse(event)));

      if (createdNewChat) {
        send({ type: "chat_created", chatId, userMessageId: userMsg?.id ?? null });
      } else {
        send({ type: "user_persisted", messageId: userMsg?.id ?? null });
      }

      let upstream: Response;
      try {
        upstream = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: openRouterHeaders(),
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
        });
      } catch (e) {
        send({ type: "error", message: `Upstream fetch failed: ${(e as Error).message}` });
        controller.close();
        return;
      }

      if (!upstream.ok || !upstream.body) {
        const text = await upstream.text().catch(() => "");
        send({ type: "error", message: `OpenRouter ${upstream.status}: ${text.slice(0, 300)}` });
        controller.close();
        return;
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const raw of lines) {
            const line = raw.trim();
            if (!line || !line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                assistant += delta;
                send({ type: "delta", text: delta });
              }
            } catch {
              /* heartbeat or comment line */
            }
          }
        }
      } catch (e) {
        send({ type: "error", message: `Stream read failed: ${(e as Error).message}` });
        controller.close();
        return;
      }

      // Persist assistant message + bump chat
      const { data: assistantMsg } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          chat_id: chatId,
          role: "assistant",
          content: assistant,
        })
        .select("id")
        .single();

      await supabase
        .from("chats")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);

      send({ type: "done", messageId: assistantMsg?.id ?? null });
      controller.close();

      // Fire-and-forget title generation for new chats
      if (createdNewChat) {
        void generateTitle(chatId!, assistant, userContent);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function generateTitle(chatId: string, assistant: string, userContent: string) {
  try {
    const supabase = await getSupabase();
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: TITLE_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Summarise this conversation in ≤6 words. No punctuation, no quotes. Reply with the title only.",
          },
          {
            role: "user",
            content: `User: ${userContent.slice(0, 500)}\n\nAssistant: ${assistant.slice(0, 800)}`,
          },
        ],
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const title = data.choices?.[0]?.message?.content?.trim().slice(0, 80);
    if (title) {
      await supabase.from("chats").update({ title }).eq("id", chatId);
    }
  } catch {
    /* non-blocking */
  }
}
