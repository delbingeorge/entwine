import { getThreadMessages } from "@/shared/lib/thread-api";

import { renderMarkdown } from "./render-markdown";

import type { Turn } from "../types";

export const loadTurns = async (threadId: string): Promise<Turn[]> => {
  const stored = await getThreadMessages(threadId);

  return stored.map((message, index) =>
    message.role === "user"
      ? {
          id: index + 1,
          role: "user",
          serverId: message.id,
          text: message.content,
          attachment:
            message.attachment === undefined
              ? null
              : { id: index + 1, ...message.attachment },
        }
      : { id: index + 1, role: "agent", html: renderMarkdown(message.content), isStreaming: false },
  );
};
