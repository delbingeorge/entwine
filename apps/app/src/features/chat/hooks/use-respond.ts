import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { AppError } from "@/shared/lib/api-client";
import { streamChat } from "@/shared/lib/chat-api";

import { escapeHtml } from "../lib/escape-html";
import { loadTurns } from "../lib/load-turns";
import { renderMarkdown } from "../lib/render-markdown";
import { createReveal } from "../lib/reveal";

import type { Attachment, Turn } from "../types";

export type Running = { controller: AbortController; reveal: ReturnType<typeof createReveal> };

interface UseRespondOptions {
  nextId: MutableRefObject<number>;
  onSettled?: () => void;
  openedAt: MutableRefObject<number>;
  running: MutableRefObject<Map<string, Running>>;
  setBusyThreads: Dispatch<SetStateAction<string[]>>;
  setTurns: Dispatch<SetStateAction<Turn[]>>;
  threadIdRef: MutableRefObject<string | null>;
}

export const useRespond = ({
  nextId,
  onSettled,
  openedAt,
  running,
  setBusyThreads,
  setTurns,
  threadIdRef,
}: UseRespondOptions) => {
  return async (
    owner: string,
    text: string,
    sentAttachment: Attachment | null,
    userTurnId: number,
    editMessageId: string | null,
  ) => {
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
        attachment:
          sentAttachment === null
            ? null
            : { kind: sentAttachment.kind, name: sentAttachment.name, size: sentAttachment.size },
        editMessageId,
        onMessage: (id) => {
          write((current) =>
            current.map((turn) =>
              turn.id === userTurnId && turn.role === "user" ? { ...turn, serverId: id } : turn,
            ),
          );
        },
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

        const reason =
          cause instanceof AppError ? cause.message : "I could not answer just now. Try again.";

        write((current) => [
          ...current.filter((turn) => turn.id !== thinkingId && turn.id !== agentId),
          {
            id: nextId.current++,
            role: "agent",
            html: `<p>${escapeHtml(reason)}</p>`,
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
};
