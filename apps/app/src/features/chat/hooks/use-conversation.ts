import { useEffect, useRef, useState } from "react";

import { streamChat, type ChatMessage } from "@/shared/lib/chat-api";

import { htmlToText } from "../lib/html-to-text";
import { renderMarkdown } from "../lib/render-markdown";

import type { Attachment, Turn, UserTurn } from "../types";

interface ConversationOptions {
  seed: Turn[];
}

const asHistory = (turns: Turn[]): ChatMessage[] =>
  turns.flatMap<ChatMessage>((turn) => {
    if (turn.role === "user") {
      const text =
        turn.attachment === null ? turn.text : `${turn.text}\n\n[attached ${turn.attachment.name}]`;

      return text.trim() === "" ? [] : [{ role: "user", text }];
    }

    if (turn.role === "agent" && turn.html !== "") {
      return [{ role: "agent", text: htmlToText(turn.html) }];
    }

    return [];
  });

export const useConversation = ({ seed }: ConversationOptions) => {
  const [turns, setTurns] = useState<Turn[]>(seed);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [value, setValue] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const nextId = useRef(1000);
  const abort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );

  const respond = async (history: ChatMessage[]) => {
    setIsBusy(true);

    const thinkingId = nextId.current++;
    setTurns((current) => [...current, { id: thinkingId, role: "thinking" }]);

    const controller = new AbortController();
    abort.current = controller;

    const agentId = nextId.current++;
    let markdown = "";
    let hasStarted = false;

    try {
      await streamChat({
        messages: history,
        signal: controller.signal,
        onToken: (token) => {
          markdown += token;

          if (!hasStarted) {
            hasStarted = true;
            setTurns((current) => [
              ...current.filter((turn) => turn.id !== thinkingId),
              { id: agentId, role: "agent", html: "", isStreaming: true },
            ]);
          }

          setTurns((current) =>
            current.map((turn) =>
              turn.id === agentId && turn.role === "agent"
                ? { ...turn, html: renderMarkdown(markdown) }
                : turn,
            ),
          );
        },
      });

      setTurns((current) =>
        current
          .filter((turn) => turn.id !== thinkingId)
          .map((turn) =>
            turn.id === agentId && turn.role === "agent" ? { ...turn, isStreaming: false } : turn,
          ),
      );
    } catch (cause) {
      if (controller.signal.aborted) {
        return;
      }

      console.error("chat failed", cause);
      setTurns((current) => [
        ...current.filter((turn) => turn.id !== thinkingId && turn.id !== agentId),
        {
          id: nextId.current++,
          role: "agent",
          html: "<p>I could not answer just now. Try again in a moment.</p>",
          isStreaming: false,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  const stop = () => {
    abort.current?.abort();
    setTurns((current) =>
      current
        .filter((turn) => turn.role !== "thinking")
        .map((turn) =>
          turn.role === "agent" && turn.isStreaming ? { ...turn, isStreaming: false } : turn,
        ),
    );
    setIsBusy(false);
  };

  const submit = () => {
    if (isBusy) {
      stop();
      return;
    }

    const text = value.trim();

    if (text === "" && attachment === null) {
      return;
    }

    const sent = attachment;
    const asked: Turn = { id: nextId.current++, role: "user", text, attachment: sent };
    const next = [...turns, asked];

    setTurns(next);
    setValue("");
    setAttachment(null);
    setEditing(null);
    void respond(asHistory(next));
  };

  return {
    attachment,
    cancelEdit: () => {
      setEditing(null);
    },
    isBusy,
    isEditing: editing !== null,
    retry: (turnId: number) => {
      if (isBusy) {
        return;
      }

      const trimmed = turns.slice(
        0,
        turns.findIndex((turn) => turn.id === turnId),
      );

      setTurns(trimmed);
      void respond(asHistory(trimmed));
    },
    setAttachment,
    setValue,
    startEdit: (turn: UserTurn) => {
      setEditing(turn.id);
      setValue(turn.text);
      setTurns((current) =>
        current.slice(
          0,
          current.findIndex((entry) => entry.id === turn.id),
        ),
      );
    },
    submit,
    turns,
    value,
  };
};
