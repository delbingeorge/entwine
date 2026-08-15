import { useEffect, useRef, useState } from "react";

import { streamChat } from "@/shared/lib/chat-api";
import { getThreadMessages } from "@/shared/lib/thread-api";

import { renderMarkdown } from "../lib/render-markdown";

import type { Attachment, Turn, UserTurn } from "../types";

interface ConversationOptions {
  onSettled?: () => void;
  seed: Turn[];
  threadId: string | null;
}

export const useConversation = ({ onSettled, seed, threadId }: ConversationOptions) => {
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

  useEffect(() => {
    if (threadId === null) {
      return;
    }

    let isStale = false;

    getThreadMessages(threadId)
      .then((stored) => {
        if (isStale) {
          return;
        }

        if (stored.length === 0) {
          setTurns(seed);
          return;
        }

        setTurns(
          stored.map((message, index) =>
            message.role === "user"
              ? { id: index + 1, role: "user", text: message.content, attachment: null }
              : {
                  id: index + 1,
                  role: "agent",
                  html: renderMarkdown(message.content),
                  isStreaming: false,
                },
          ),
        );
      })
      .catch((cause: unknown) => {
        console.error("could not load this chat", cause);
      });

    return () => {
      isStale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const respond = async (text: string) => {
    if (threadId === null) {
      return;
    }

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
        text,
        threadId,
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
      onSettled?.();
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
    const asked = text === "" ? `Shared ${sent?.name ?? "a file"}` : text;

    setTurns((current) => [
      ...current,
      { id: nextId.current++, role: "user", text: asked, attachment: sent },
    ]);
    setValue("");
    setAttachment(null);
    setEditing(null);
    void respond(asked);
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

      const previous = turns
        .slice(
          0,
          turns.findIndex((turn) => turn.id === turnId),
        )
        .reverse()
        .find((turn) => turn.role === "user");

      if (previous?.role === "user") {
        void respond(previous.text);
      }
    },
    setAttachment,
    setValue,
    startEdit: (turn: UserTurn) => {
      setEditing(turn.id);
      setValue(turn.text);
    },
    submit,
    turns,
    value,
  };
};
