import { useEffect, useRef } from "react";

import { ChatRoundIcon } from "@solar-icons/react/linear/chat-round";
import { TrashBinTrashIcon } from "@solar-icons/react/linear/trash-bin-trash";

import { LucideIcon } from "@/shared/components/lucide-icon";
import type { ThreadSummary } from "@/shared/lib/thread-api";

import { relativeTime } from "../lib/relative-time";

interface HistoryRowProps {
  id: string;
  isActive: boolean;
  isCurrent: boolean;
  onDelete: () => void;
  onHover: () => void;
  onSelect: () => void;
  thread: ThreadSummary;
}

export const HistoryRow = ({
  id,
  isActive,
  isCurrent,
  onDelete,
  onHover,
  onSelect,
  thread,
}: HistoryRowProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      aria-selected={isActive}
      className={`group flex w-full items-center pr-2 ${isActive ? "bg-composer-track" : ""}`}
      id={id}
      onMouseMove={onHover}
      ref={ref}
      role="option"
    >
      <button
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
        onClick={onSelect}
        tabIndex={-1}
        type="button"
      >
        <ChatRoundIcon className="size-4 shrink-0 text-composer-soft" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] text-composer-ink">
            {thread.title === "" ? "New chat" : thread.title}
          </span>
          <span className="block truncate font-mono text-[11px] text-composer-placeholder">
            {relativeTime(thread.lastMessageAt)}
          </span>
        </span>
        {isCurrent ? (
          <LucideIcon className="size-4 shrink-0 text-composer-ink" name="check" strokeWidth={2} />
        ) : null}
        {isActive ? (
          <LucideIcon
            className="size-3.5 shrink-0 text-composer-placeholder"
            name="corner-down-left"
          />
        ) : null}
      </button>
      <button
        aria-label={`Delete ${thread.title}`}
        className={`flex size-7 shrink-0 items-center justify-center rounded-md text-composer-placeholder hover:bg-composer-surface hover:text-composer-ink focus-visible:opacity-100 group-hover:opacity-100 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        onClick={onDelete}
        tabIndex={-1}
        title={`Delete ${thread.title}`}
        type="button"
      >
        <TrashBinTrashIcon className="size-3.5" />
      </button>
    </div>
  );
};
