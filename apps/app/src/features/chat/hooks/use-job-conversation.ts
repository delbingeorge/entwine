import { escapeHtml } from "../lib/escape-html";

import { useConversation } from "./use-conversation";

import type { Job, Turn } from "../types";

const openingPost = (job: Job) =>
  `<h4>Why this one</h4><p>${escapeHtml(job.rationale)}</p>` +
  `<h4>The role</h4><p>${escapeHtml(job.description)}</p>` +
  `<p><strong>${escapeHtml(job.salary)}</strong> · ${escapeHtml(job.location)} · <code>${escapeHtml(job.stack.join(", "))}</code></p>`;

export const useJobConversation = (job: Job) => {
  const seed: Turn[] = [{ id: 1, role: "agent", html: openingPost(job), isStreaming: false }];

  return useConversation({ seed, threadId: null });
};
