import { useConversation } from "./use-conversation";

import type { Turn } from "../types";

const greeting: Turn[] = [
  {
    id: 1,
    role: "agent",
    isStreaming: false,
    html:
      "<p>I'm Ellie. I help engineers across India and South-East Asia find their next role.</p>" +
      "<p>Start by sharing your resume — a PDF, up to 8MB. I'll read it and fill in your experience, education and skills under <strong>Profile</strong>, so you never have to type any of that out.</p>" +
      "<p>Any job I find turns up here as a card. Open one and it gets its own chat, where you ask me about that job and keep track of where you've reached — applied, interviewing, and so on. This chat stays the main one.</p>" +
      "<p>Whenever you're ready, tell me what you're looking for.</p>",
  },
];

export const useChat = () => useConversation({ seed: greeting });
