import { useEffect, useRef, useState } from "react";

import type { Attachment, Turn, UserTurn } from "../types";

interface ConversationOptions {
  replyFor: (text: string, attachment: Attachment | null) => string;
  seed: Turn[];
  seedAttachment?: Attachment | null;
}

export const useConversation = ({ replyFor, seed, seedAttachment = null }: ConversationOptions) => {
  const [turns, setTurns] = useState<Turn[]>(seed);
  const [attachment, setAttachment] = useState<Attachment | null>(seedAttachment);
  const [value, setValue] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const nextId = useRef(1000);
  const timers = useRef<number[]>([]);

  const stopTimers = () => {
    timers.current.forEach((timer) => {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    });
    timers.current = [];
  };

  useEffect(() => stopTimers, []);

  const stream = (turnId: number, html: string) => {
    const words = html.match(/<[^>]+>|\s+|[^\s<]+/gu) ?? [];
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      const partial = words.slice(0, index).join("");

      setTurns((current) =>
        current.map((turn) =>
          turn.id === turnId && turn.role === "agent" ? { ...turn, html: partial } : turn,
        ),
      );

      if (index >= words.length) {
        window.clearInterval(timer);
        setTurns((current) =>
          current.map((turn) =>
            turn.id === turnId && turn.role === "agent"
              ? { ...turn, html, isStreaming: false }
              : turn,
          ),
        );
        setIsBusy(false);
      }
    }, 16);

    timers.current.push(timer);
  };

  const respond = (text: string, sent: Attachment | null) => {
    setIsBusy(true);
    const thinkingId = nextId.current++;
    setTurns((current) => [...current, { id: thinkingId, role: "thinking" }]);

    const timer = window.setTimeout(() => {
      const agentId = nextId.current++;
      setTurns((current) => [
        ...current.filter((turn) => turn.id !== thinkingId),
        { id: agentId, role: "agent", html: "", isStreaming: true },
      ]);
      stream(agentId, replyFor(text, sent));
    }, 700);

    timers.current.push(timer);
  };

  const stop = () => {
    stopTimers();
    setTurns((current) => {
      const last = current[current.length - 1];

      if (last?.role === "thinking" || (last?.role === "agent" && last.html === "")) {
        return current.slice(0, -1);
      }

      return current.map((turn) =>
        turn.role === "agent" && turn.isStreaming ? { ...turn, isStreaming: false } : turn,
      );
    });
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
    setTurns((current) => [
      ...current,
      { id: nextId.current++, role: "user", text, attachment: sent },
    ]);
    setValue("");
    setAttachment(null);
    setEditing(null);
    respond(text, sent);
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

      setTurns((current) => {
        const index = current.findIndex((turn) => turn.id === turnId);
        const previous = current
          .slice(0, index)
          .reverse()
          .find((turn) => turn.role === "user");

        window.setTimeout(() => {
          respond(previous?.role === "user" ? previous.text : "", null);
        }, 0);

        return current.filter((turn) => turn.id !== turnId);
      });
    },
    setAttachment,
    setValue,
    submit,
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
    turns,
    value,
  };
};
