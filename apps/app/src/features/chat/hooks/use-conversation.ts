import { useEffect, useRef, useState } from "react";

import { loadTurns } from "../lib/load-turns";

import { useRespond } from "./use-respond";

import type { Attachment, Turn, UserTurn } from "../types";
import type { Running } from "./use-respond";

interface ConversationOptions {
  onSettled?: () => void;
  seed: Turn[];
  threadId: string | null;
}

export const useConversation = ({ onSettled, seed, threadId }: ConversationOptions) => {
  const [turns, setTurns] = useState<Turn[]>(seed);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [value, setValue] = useState("");
  const [busyThreads, setBusyThreads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    setIsLoading(true);
    setTurns(isAwaited ? [{ id: nextId.current++, role: "thinking" }] : []);

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
      })
      .finally(() => {
        if (openedAt.current === opened) {
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const respond = useRespond({
    nextId,
    onSettled,
    openedAt,
    running,
    setBusyThreads,
    setTurns,
    threadIdRef,
  });

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

    const editedId = editing;
    const editedTurn =
      editedId === null
        ? undefined
        : turns.find(
            (turn): turn is UserTurn => turn.id === editedId && turn.role === "user",
          );
    const editMessageId = editedTurn?.serverId ?? null;

    const userTurnId = nextId.current++;

    setTurns((current) => {
      const cutIndex = editedId === null ? -1 : current.findIndex((turn) => turn.id === editedId);
      const base = cutIndex === -1 ? current : current.slice(0, cutIndex);

      return [...base, { id: userTurnId, role: "user", text: asked, attachment: sent }];
    });
    setValue("");
    setAttachment(null);
    setEditing(null);
    void respond(threadId, asked, sent, userTurnId, editMessageId);
  };

  return {
    attachment,
    cancelEdit: () => {
      setEditing(null);
    },
    isBusy,
    isEditing: editing !== null,
    isLoading,
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
