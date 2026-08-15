import { AppError } from "./api-client";
import { env } from "./env";
import { getSession } from "./session";

export interface ChatMessage {
  role: "agent" | "user";
  text: string;
}

interface StreamOptions {
  messages: ChatMessage[];
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

const decodeEvent = (block: string) => {
  const dataLines = block
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6));

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(dataLines.join("")) as { message?: string; text?: string };
  } catch {
    return null;
  }
};

export const streamChat = async ({ messages, onToken, signal }: StreamOptions) => {
  const session = await getSession();

  if (session === null) {
    throw new AppError("unauthorized", "You are signed out.", 401);
  }

  const response = await fetch(`${env.VITE_API_URL}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok || response.body === null) {
    throw new AppError("chat_failed", "Ellie could not answer just now.", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      if (block.startsWith("event: done")) {
        return;
      }

      if (block.startsWith("event: error")) {
        const payload = decodeEvent(block);

        throw new AppError("chat_failed", payload?.message ?? "Ellie stopped early.", 502);
      }

      const payload = decodeEvent(block);

      if (payload?.text !== undefined) {
        onToken(payload.text);
      }
    }
  }
};
