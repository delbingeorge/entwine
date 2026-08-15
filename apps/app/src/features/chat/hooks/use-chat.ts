import { replies, seededAttachment } from "../data";
import { jobs } from "../jobs";
import { escapeHtml } from "../lib/escape-html";

import { useConversation } from "./use-conversation";

import type { Attachment, Turn } from "../types";

const replyFor = (text: string, attachment: Attachment | null) => {
  if (attachment !== null && text.trim() === "") {
    return `<p>Read <code>${escapeHtml(attachment.name)}</code>. Tell me what you want done with it and I will start there.</p>`;
  }

  const hit = replies.find((reply) => reply.on.test(text));

  if (hit !== undefined) {
    return hit.html;
  }

  const context =
    attachment === null
      ? ""
      : ` — and I have <code>${escapeHtml(attachment.name)}</code> in context`;

  return `<p>Noted${context}. Ask me about any of the roles above and I will open a thread for it.</p>`;
};

const seed: Turn[] = [
  {
    id: 1,
    role: "user",
    text: "here is my resume — what should I be looking at?",
    attachment: seededAttachment,
  },
  {
    id: 2,
    role: "agent",
    isStreaming: false,
    jobIds: jobs.map((job) => job.id),
    html:
      "<p>Six years of Go and Postgres, mostly on systems where correctness matters. That narrows things usefully.</p>" +
      "<p>Three that clear your floor and match how you like to work. Open one to dig in.</p>",
  },
];

export const useChat = () => useConversation({ replyFor, seed, seedAttachment: null });
