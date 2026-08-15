import { jobReplies } from "../jobs";
import { escapeHtml } from "../lib/escape-html";

import { useConversation } from "./use-conversation";

import type { Job, Turn } from "../types";

const openingPost = (job: Job) =>
  `<h4>Why this one</h4><p>${escapeHtml(job.rationale)}</p>` +
  `<h4>The role</h4><p>${escapeHtml(job.description)}</p>` +
  `<p><strong>${escapeHtml(job.salary)}</strong> · ${escapeHtml(job.location)} · <code>${escapeHtml(job.stack.join(", "))}</code></p>`;

const replyFor = (text: string) => {
  const hit = jobReplies.find((reply) => reply.on.test(text));

  if (hit !== undefined) {
    return hit.html;
  }

  return "<p>I only have the posting and your profile to go on here. Ask me about the salary band, the interview process, the team, or whether the location is negotiable.</p>";
};

export const useJobConversation = (job: Job) => {
  const seed: Turn[] = [{ id: 1, role: "agent", html: openingPost(job), isStreaming: false }];

  return useConversation({ replyFor, seed });
};
