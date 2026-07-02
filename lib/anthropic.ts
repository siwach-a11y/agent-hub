import Anthropic from "@anthropic-ai/sdk";
import type { MessageCreateParams } from "@anthropic-ai/sdk/resources/messages/messages";

const MODEL = "claude-opus-4-5";

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

export async function streamChat(
  prompt: string,
  useWebSearch: boolean
): Promise<ReadableStream<Uint8Array>> {
  const client = getAnthropicClient();

  const tools: MessageCreateParams["tools"] = useWebSearch
    ? [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ]
    : undefined;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    tools,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
