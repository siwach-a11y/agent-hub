/**
 * Streams a chat completion from the server `/api/chat` route, invoking
 * `onText` with the cumulative text so far. Returns the final text.
 *
 * The route runs server-side (locally via `next dev`, in production on the
 * Cloudflare Worker) and holds ANTHROPIC_API_KEY as a server secret.
 */
export async function streamChatResponse(
  prompt: string,
  useWebSearch: boolean,
  onText: (cumulative: string) => void
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, useWebSearch }),
  });
  if (!res.ok) throw new Error("Failed to get response");

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let text = "";
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
  }
  return text;
}
