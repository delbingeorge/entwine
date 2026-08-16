import { useConversation } from "./use-conversation";

interface ChatOptions {
  onSettled: () => void;
  threadId: string | null;
}

export const useChat = ({ onSettled, threadId }: ChatOptions) =>
  useConversation({ onSettled, seed: [], threadId });
