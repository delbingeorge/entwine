import { useEffect, useRef, useState } from "react";

import { streamChat } from "@/shared/lib/chat-api";

import { loadTurns } from "../lib/load-turns";
import { renderMarkdown } from "../lib/render-markdown";
import { createReveal } from "../lib/reveal";

import type { Attachment, Turn, UserTurn } from "../types";

interface ConversationOptions {
  onSettled?: () => void;
  seed: Turn[];
  threadId: string | null;
}

type Running = { controller: AbortController; reveal: ReturnType<typeof createReveal> };

export const useConversation = ({ onSettled, seed, threadId }: ConversationOptions) => {
  const [turns, setTurns] = useState<Turn[]>(seed);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [value, setValue] = useState("");
  const [busyThreads, setBusyThreads] = useState<string[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const nextId = useRef(1000);
  const running = useRef(new Map<string, Running>());
  const openedAt = useRef(0);
  const threadIdRef = useRef(threadId);
  threadIdRef.current = threadId;
  const isBusy = threadId !== null && busyThreads.includes(threadId);

  useEffect(
    () => () => {
      running.current.forEach(({ controller, reveal }) => {
        controller.abort();
        reveal.kill();
      });
    },
    [],
  );

  useEffect(() => {
    if (threadId === null) {
      return;
    }

    openedAt.current += 1;
    const opened = openedAt.current;
    const isAwaited = running.current.has(threadId);

    loadTurns(threadId)
      .then((stored) => {
        if (openedAt.current !== opened) {
          return;
        }

        if (stored.length === 0 && !isAwaited) {
          setTurns(seed);
          return;
        }

        setTurns(isAwaited ? [...stored, { id: nextId.current++, role: "thinking" }] : stored);
      })
      .catch((cause: unknown) => {
        console.error("could not load this chat", cause);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const respond = async (owner: string, text: string) => {
    const opened = openedAt.current;
    const isShowing = () => openedAt.current === opened;
    const write = (update: (current: Turn[]) => Turn[]) => {
      if (isShowing()) {
        setTurns(update);
      }
    };

    setBusyThreads((current) => [...current, owner]);

    const thinkingId = nextId.current++;
    write((current) => [...current, { id: thinkingId, role: "thinking" }]);

    const agentId = nextId.current++;
    let markdown = "";
    let hasStarted = false;

    const reveal = createReveal((count) => {
      write((current) =>
        current.map((turn) =>
          turn.id === agentId && turn.role === "agent"
            ? { ...turn, html: renderMarkdown(markdown.slice(0, count)) }
            : turn,
        ),
      );
    });

    const controller = new AbortController();
    running.current.set(owner, { controller, reveal });

    try {
      await streamChat({
        text,
        threadId: owner,
        signal: controller.signal,
        onToken: (token) => {
          markdown += token;

          if (!hasStarted) {
            hasStarted = true;
            write((current) => [
              ...current.filter((turn) => turn.id !== thinkingId),
              { id: agentId, role: "agent", html: "", isStreaming: true },
            ]);
          }

          reveal.to(markdown.length);
        },
      });

      await reveal.settle(markdown.length);

      write((current) =>
        current
          .filter((turn) => turn.id !== thinkingId)
          .map((turn) =>
            turn.id === agentId && turn.role === "agent" ? { ...turn, isStreaming: false } : turn,
          ),
      );
    } catch (cause) {
      reveal.kill();

      if (!controller.signal.aborted) {
        console.error("chat failed", cause);
        write((current) => [
          ...current.filter((turn) => turn.id !== thinkingId && turn.id !== agentId),
          {
            id: nextId.current++,
            role: "agent",
            html: "<p>I could not answer just now. Try again in a moment.</p>",
            isStreaming: false,
          },
        ]);
      }
    } finally {
      running.current.delete(owner);
      setBusyThreads((current) => current.filter((id) => id !== owner));
      onSettled?.();

      if (!isShowing() && owner === threadIdRef.current) {
        loadTurns(owner)
          .then((stored) => {
            if (owner === threadIdRef.current) {
              setTurns(stored);
            }
          })
          .catch((cause: unknown) => {
            console.error("could not load this chat", cause);
          });
      }
    }
  };

  const stop = () => {
    if (threadId === null) {
      return;
    }

    const active = running.current.get(threadId);
    active?.controller.abort();
    active?.reveal.kill();
    running.current.delete(threadId);

    setTurns((current) =>
      current
        .filter((turn) => turn.role !== "thinking")
        .map((turn) =>
          turn.role === "agent" && turn.isStreaming ? { ...turn, isStreaming: false } : turn,
        ),
    );
    setBusyThreads((current) => current.filter((id) => id !== threadId));
  };

  const submit = () => {
    if (threadId === null) {
      return;
    }

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
    void respond(threadId, asked);
  };

  return {
    attachment,
    cancelEdit: () => {
      setEditing(null);
    },
    isBusy,
    isEditing: editing !== null,
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
