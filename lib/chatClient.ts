import { getStoredKey, MISSING_KEY_ERROR } from "./anthropicKey";

// Model per the Anthropic API reference.
const MODEL = "claude-opus-4-5";

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatUpdate {
  text: string;
  sources: ChatSource[];
}

type OnUpdate = (update: ChatUpdate) => void;

/**
 * Streams a chat completion with web search. Tries the server `/api/chat`
 * route first (works when deployed to a backend); if none exists (static
 * GitHub Pages demo), falls back to calling Anthropic directly from the
 * browser with the visitor's own stored key.
 *
 * `onUpdate` receives the cumulative text and any web-search sources so far.
 * Throws an error named MISSING_KEY_ERROR when no backend and no key exist.
 */
export async function streamChatResponse(
  prompt: string,
  useWebSearch: boolean,
  onUpdate: OnUpdate
): Promise<ChatUpdate> {
  const server = await tryServer(prompt, useWebSearch, onUpdate);
  if (server.handled) return server.update;

  return streamBrowserDirect(prompt, useWebSearch, onUpdate);
}

async function tryServer(
  prompt: string,
  useWebSearch: boolean,
  onUpdate: OnUpdate
): Promise<{ handled: boolean; update: ChatUpdate }> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, useWebSearch }),
    });
  } catch {
    return { handled: false, update: { text: "", sources: [] } };
  }
  if (!res.ok || !res.body) {
    return { handled: false, update: { text: "", sources: [] } };
  }

  // The server route streams plain text (no structured sources).
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onUpdate({ text, sources: [] });
  }
  return { handled: true, update: { text, sources: [] } };
}

async function streamBrowserDirect(
  prompt: string,
  useWebSearch: boolean,
  onUpdate: OnUpdate
): Promise<ChatUpdate> {
  const key = getStoredKey();
  if (!key) {
    const err = new Error("Add your Anthropic API key to use AI.");
    err.name = MISSING_KEY_ERROR;
    throw err;
  }

  // Country is applied via the prompt (the web_search user_location parameter
  // only supports a limited set of countries and rejects others with a 400).
  const webSearchTool = {
    type: "web_search_20250305",
    name: "web_search",
    max_uses: 5,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "user", content: prompt }],
      ...(useWebSearch ? { tools: [webSearchTool] } : {}),
    }),
  });

  if (res.status === 401) {
    throw new Error("Invalid API key. Check the key and re-enter it.");
  }
  if (!res.ok || !res.body) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const sources: ChatSource[] = [];
  const seen = new Set<string>();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const event = JSON.parse(data);

        // Web-search results arrive whole in a content_block_start event.
        if (
          event.type === "content_block_start" &&
          event.content_block?.type === "web_search_tool_result" &&
          Array.isArray(event.content_block.content)
        ) {
          for (const r of event.content_block.content) {
            if (r?.type === "web_search_result" && r.url && !seen.has(r.url)) {
              seen.add(r.url);
              sources.push({ title: r.title || r.url, url: r.url });
            }
          }
          onUpdate({ text, sources: [...sources] });
        }

        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          text += event.delta.text;
          onUpdate({ text, sources: [...sources] });
        }
      } catch {
        // ignore keep-alives / non-JSON lines
      }
    }
  }

  return { text, sources };
}
