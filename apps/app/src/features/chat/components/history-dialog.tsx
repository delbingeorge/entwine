import { useEffect, useState } from "react";

import { ChatRoundIcon } from "@solar-icons/react/linear/chat-round";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";

import { LucideIcon } from "@/shared/components/lucide-icon";
import type { ThreadSummary } from "@/shared/lib/thread-api";

import { useDialogTransition } from "../hooks/use-dialog-transition";

import { HistoryGroup } from "./history-group";
import { JobStatusChip } from "./job-status-chip";

import type { Job, JobStatus } from "../types";

interface HistoryDialogProps {
  canStartNew: boolean;
  currentId: string;
  isOpen: boolean;
  jobs: { job: Job; status: JobStatus }[];
  onOpenJob: (id: string) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  threads: ThreadSummary[];
}

const rowId = (index: number) => `history-option-${String(index)}`;

export const HistoryDialog = ({
  canStartNew,
  currentId,
  isOpen,
  jobs,
  onOpenJob,
  onClose,
  onDelete,
  onNew,
  onSelect,
  threads,
}: HistoryDialogProps) => {
  const { isMounted, panelRef, scrimRef } = useDialogTransition(isOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      threads.findIndex((thread) => thread.id === currentId),
    ),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const needle = query.trim().toLowerCase();
  const hits = threads.filter(
    (thread) => needle === "" || thread.title.toLowerCase().includes(needle),
  );
  const chats = hits.filter((thread) => thread.kind !== "coaching");
  const sessions = hits.filter((thread) => thread.kind === "coaching");
  const ordered = [...chats, ...sessions];

  const options = ordered.length + 1;
  const safeIndex = activeIndex >= options ? 0 : activeIndex;
  const isNewActive = safeIndex === ordered.length;

  const choose = (index: number) => {
    const thread = ordered[index];

    if (thread === undefined) {
      if (canStartNew) {
        onNew();
      }

      return;
    }

    onSelect(thread.id);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 pt-[14vh] font-ui"
      ref={scrimRef}
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-label="Your chats"
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-composer-line bg-composer-surface shadow-[0_24px_64px_rgba(0,0,0,0.3)]"
        onClick={(event) => {
          event.stopPropagation();
        }}
        ref={panelRef}
        role="dialog"
      >
        <label className="flex shrink-0 items-center gap-3 border-b border-composer-line px-4 py-3">
          <LucideIcon className="size-4 shrink-0 text-composer-soft" name="search" />
          <input
            aria-activedescendant={rowId(safeIndex)}
            aria-controls="history-options"
            aria-expanded
            autoFocus
            className="composer-field w-full bg-transparent text-[13.5px] text-composer-ink outline-none placeholder:text-composer-placeholder"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((safeIndex + 1) % options);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((safeIndex - 1 + options) % options);
              }

              if (event.key === "Enter") {
                event.preventDefault();
                choose(safeIndex);
              }
            }}
            placeholder="Search your chats"
            role="combobox"
            value={query}
          />
          <kbd className="shrink-0 rounded bg-composer-track px-1.5 py-0.5 text-[10px] text-composer-soft">
            ESC
          </kbd>
        </label>

        <div className="overflow-y-auto py-1" id="history-options" role="listbox">
          <HistoryGroup
            activeIndex={safeIndex}
            currentId={currentId}
            emptyLabel="No chats match that search."
            label="CHATS"
            offset={0}
            onDelete={onDelete}
            onHover={setActiveIndex}
            onSelect={onSelect}
            rowId={rowId}
            threads={chats}
          />

          {sessions.length === 0 ? null : (
            <HistoryGroup
              activeIndex={safeIndex}
              currentId={currentId}
              label="COACHING"
              offset={chats.length}
              onDelete={onDelete}
              onHover={setActiveIndex}
              onSelect={onSelect}
              rowId={rowId}
              threads={sessions}
            />
          )}

          {jobs.length === 0 ? null : (
            <div>
              <p className="px-4 pt-2.5 pb-1 text-[10px] tracking-widest text-composer-placeholder">
                JOBS
              </p>
              {jobs.map(({ job, status }) => (
                <div className="group flex w-full items-center pr-2" key={job.id}>
                  <button
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left"
                    onClick={() => {
                      onOpenJob(job.id);
                    }}
                    type="button"
                  >
                    <ChatRoundIcon className="size-4 shrink-0 text-composer-soft" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-composer-ink">
                        {job.title} · {job.company}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-composer-placeholder">
                        {job.salary} · {job.location}
                      </span>
                    </span>
                    <JobStatusChip status={status} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="px-4 pt-2.5 pb-1 text-[10px] tracking-widest text-composer-placeholder">
              ACTIONS
            </p>
            <div
              aria-selected={isNewActive}
              className={`group flex w-full items-center pr-2 ${isNewActive ? "bg-composer-track" : ""}`}
              id={rowId(ordered.length)}
              onMouseMove={() => {
                setActiveIndex(ordered.length);
              }}
              role="option"
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left disabled:opacity-40"
                disabled={!canStartNew}
                onClick={onNew}
                tabIndex={-1}
                type="button"
              >
                <PenNewSquareIcon className="size-4 shrink-0 text-composer-soft" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-composer-ink">
                    Start a new chat…
                  </span>
                  <span className="block truncate font-mono text-[11px] text-composer-placeholder">
                    {canStartNew ? "Ask Ellie something else" : "Wait for the current reply"}
                  </span>
                </span>
                {isNewActive ? (
                  <LucideIcon
                    className="size-3.5 shrink-0 text-composer-placeholder"
                    name="corner-down-left"
                  />
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
