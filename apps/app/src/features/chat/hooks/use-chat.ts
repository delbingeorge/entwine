import { useConversation } from "./use-conversation";

interface ChatOptions {
  onReply: (text: string) => void;
  onSettled: () => void;
  threadId: string | null;
}

export const useChat = ({ onReply, onSettled, threadId }: ChatOptions) =>
  useConversation({ onReply, onSettled, seed: [], threadId });
