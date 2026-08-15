import { z } from "zod";

import { apiRequest } from "./api-client";

const threadSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  status: z.string().optional(),
  lastMessageAt: z.string().optional(),
  createdAt: z.string(),
});

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["agent", "user"]),
  content: z.string(),
  createdAt: z.string(),
});

export type ThreadSummary = z.infer<typeof threadSchema>;
export type StoredMessage = z.infer<typeof messageSchema>;

export const listThreads = () => apiRequest("/v1/threads", z.array(threadSchema));

interface NewThread {
  kind?: "coaching" | "main";
  title?: string;
}

export const createThread = (thread: NewThread = {}) =>
  apiRequest("/v1/threads", threadSchema, {
    method: "POST",
    body: JSON.stringify({ kind: thread.kind ?? "main", title: thread.title ?? "" }),
  });

export const getThreadMessages = (threadId: string) =>
  apiRequest(`/v1/threads/${threadId}/messages`, z.array(messageSchema));

export const deleteThread = (threadId: string) =>
  apiRequest(`/v1/threads/${threadId}`, z.unknown(), { method: "DELETE" });
