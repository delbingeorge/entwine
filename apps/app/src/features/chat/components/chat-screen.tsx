import { useEffect, useRef } from "react";

import { BrandMark } from "@/shared/components/brand-mark";

import { useChat } from "../hooks/use-chat";
import { classifyFile, humanSize } from "../lib/classify-file";

import { AgentTurnRow } from "./agent-turn-row";
import { Composer } from "./composer";
import { ThinkingRow } from "./thinking-row";
import { UserTurnRow } from "./user-turn-row";

import "../styles/md-body.css";

export const ChatScreen = () => {
  const chat = useChat();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (scroller !== null) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [chat.turns]);

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center px-8">
        <BrandMark />
      </header>

      <div className="grid min-h-0 flex-1 px-8 pb-4" style={{ gridTemplateRows: "1fr auto" }}>
        <div className="min-h-0 overflow-y-auto" ref={scrollerRef}>
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex flex-col gap-6 pt-6 pb-8 font-ui">
              {chat.turns.map((turn) => {
                if (turn.role === "user") {
                  return (
                    <UserTurnRow
                      key={turn.id}
                      onCopy={() => {
                        void navigator.clipboard.writeText(turn.text);
                      }}
                      onEdit={() => {
                        chat.startEdit(turn);
                      }}
                      turn={turn}
                    />
                  );
                }

                if (turn.role === "thinking") {
                  return <ThinkingRow key={turn.id} />;
                }

                return (
                  <AgentTurnRow
                    key={turn.id}
                    onCopy={() => {
                      void navigator.clipboard.writeText(turn.html.replace(/<[^>]+>/gu, ""));
                    }}
                    onRetry={() => {
                      chat.retry(turn.id);
                    }}
                    turn={turn}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <Composer
          attachment={chat.attachment}
          isBusy={chat.isBusy}
          isEditing={chat.isEditing}
          onCancelEdit={() => {
            chat.setValue("");
            chat.cancelEdit();
          }}
          onFile={(file) => {
            if (file === undefined) {
              return;
            }

            const kind = classifyFile(file);
            chat.setAttachment({
              id: Date.now(),
              name: file.name,
              kind,
              size: humanSize(file.size),
              url: kind === "image" ? URL.createObjectURL(file) : undefined,
            });
          }}
          onRemoveAttachment={() => {
            chat.setAttachment(null);
          }}
          onSubmit={chat.submit}
          onValueChange={chat.setValue}
          value={chat.value}
        />
      </div>
    </div>
  );
};
