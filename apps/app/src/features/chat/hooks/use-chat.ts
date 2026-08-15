import { useEffect, useRef, useState } from "react";

import { replies, seededAttachment } from "../data";

import type { Attachment, Turn, UserTurn } from "../types";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/gu, (character) => {
    const table: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

    return table[character] ?? character;
  });

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

  return `<p>Noted${context}. This prototype answers from a small canned set, so treat the wording as a placeholder; the states around it are the real thing.</p>`;
};

const seededTurns = (): Turn[] => [
  {
    id: 1,
    role: "user",
    text: "what is left before we can ship the storefront?",
    attachment: null,
  },
  { id: 2, role: "agent", html: replies[3]?.html ?? "", isStreaming: false },
];

export const useChat = () => {
  const [turns, setTurns] = useState<Turn[]>(seededTurns);
  const [attachment, setAttachment] = useState<Attachment | null>(seededAttachment);
  const [value, setValue] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const nextId = useRef(3);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => {
        window.clearInterval(timer);
        window.clearTimeout(timer);
      });
    },
    [],
  );

  const stopTimers = () => {
    timers.current.forEach((timer) => {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    });
    timers.current = [];
  };

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

      if (last?.role === "thinking") {
        return current.slice(0, -1);
      }

      if (last?.role === "agent" && last.html === "") {
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

  const startEdit = (turn: UserTurn) => {
    setEditing(turn.id);
    setValue(turn.text);
    setTurns((current) =>
      current.slice(
        0,
        current.findIndex((entry) => entry.id === turn.id),
      ),
    );
  };

  const retry = (turnId: number) => {
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
  };

  return {
    attachment,
    cancelEdit: () => {
      setEditing(null);
    },
    isBusy,
    isEditing: editing !== null,
    retry,
    setAttachment,
    setValue,
    startEdit,
    stop,
    submit,
    turns,
    value,
  };
};
