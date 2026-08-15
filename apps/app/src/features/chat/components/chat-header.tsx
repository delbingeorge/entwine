import { useState } from "react";

import { CompassIcon } from "@solar-icons/react/linear/compass";
import { HistoryIcon } from "@solar-icons/react/linear/history";
import { UserCircleIcon } from "@solar-icons/react/linear/user-circle";
import { useNavigate } from "@tanstack/react-router";

import { BrandMark } from "@/shared/components/brand-mark";
import { useLongPress } from "@/shared/hooks/use-long-press";
import type { SettingsTab } from "@/shared/lib/settings-tabs";
import type { ThreadSummary } from "@/shared/lib/thread-api";

import { jobById } from "../jobs";

import { HistoryDialog } from "./history-dialog";
import { JumpMenu } from "./jump-menu";

import type { JobStatus } from "../types";

interface ChatHeaderProps {
  currentThreadId: string | null;
  onDeleteThread: (id: string) => void;
  onNewThread: () => void;
  onOpenJob: (id: string) => void;
  onSelectThread: (id: string) => void;
  startedIds: string[];
  statusOf: (id: string) => JobStatus;
  threads: ThreadSummary[];
}

export const ChatHeader = ({
  currentThreadId,
  onDeleteThread,
  onNewThread,
  onOpenJob,
  onSelectThread,
  startedIds,
  statusOf,
  threads,
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);

  const openSettings = (tab: SettingsTab) => {
    setIsJumpOpen(false);
    void navigate({ search: { tab }, to: "/settings" });
  };

  const longPress = useLongPress(() => {
    setIsJumpOpen(true);
  });

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between px-8">
        <BrandMark />
        <div className="flex items-center gap-1.5">
          <button
            aria-label="History"
            className="flex size-6 items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
            onClick={() => {
              setIsHistoryOpen(true);
            }}
            title="History"
            type="button"
          >
            <HistoryIcon className="size-4" />
          </button>
          <button
            aria-label="Coaching"
            className="flex size-6 items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
            onClick={() => {
              void navigate({ search: { tab: "Negotiation" }, to: "/coaching" });
            }}
            title="Coaching"
            type="button"
          >
            <CompassIcon className="size-4" />
          </button>
          <div className="relative">
            <button
              aria-label="Profile"
              className="flex size-6 items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
              onClick={() => {
                if (longPress.didLongPress()) {
                  return;
                }

                openSettings("Account");
              }}
              title="Profile. Hold for sections."
              type="button"
              {...longPress.handlers}
            >
              <UserCircleIcon className="size-4" />
            </button>
            {isJumpOpen ? (
              <JumpMenu
                onClose={() => {
                  setIsJumpOpen(false);
                }}
                onPick={openSettings}
              />
            ) : null}
          </div>
        </div>
      </header>
      <HistoryDialog
        currentId={currentThreadId ?? ""}
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
        }}
        onDelete={(id) => {
          onDeleteThread(id);
        }}
        onNew={() => {
          onNewThread();
          setIsHistoryOpen(false);
        }}
        onOpenJob={(id) => {
          onOpenJob(id);
          setIsHistoryOpen(false);
        }}
        onSelect={(id) => {
          onSelectThread(id);
          setIsHistoryOpen(false);
        }}
        jobs={startedIds.flatMap((id) => {
          const job = jobById(id);

          return job === undefined ? [] : [{ job, status: statusOf(id) }];
        })}
        threads={threads}
      />
    </>
  );
};
