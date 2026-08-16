import { useState } from "react";

import { CompassIcon } from "@solar-icons/react/linear/compass";
import { HistoryIcon } from "@solar-icons/react/linear/history";
import { UserCircleIcon } from "@solar-icons/react/linear/user-circle";
import { useNavigate } from "@tanstack/react-router";

import { BrandMark } from "@/shared/components/brand-mark";
import { usePressMenu } from "@/shared/hooks/use-press-menu";
import { coachingTabs, type CoachingTab } from "@/shared/lib/coaching-tabs";
import { settingsTabs, type SettingsTab } from "@/shared/lib/settings-tabs";
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
  const openSettings = (tab: SettingsTab) => {
    void navigate({ search: { tab }, to: "/settings" });
  };

  const openCoaching = (tab: CoachingTab) => {
    void navigate({ search: { tab }, to: "/coaching" });
  };

  const settingsMenu = usePressMenu((index) => {
    openSettings(settingsTabs[index] ?? "Account");
  });

  const coachingMenu = usePressMenu((index) => {
    openCoaching(coachingTabs[index] ?? "Negotiation");
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
          <div className="relative">
            <button
              aria-label="Coaching"
              className="flex size-6 touch-none items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
              onClick={() => {
                if (coachingMenu.didHold()) {
                  return;
                }

                openCoaching("Negotiation");
              }}
              title="Coaching. Hold for sections."
              type="button"
              {...coachingMenu.triggerProps}
            >
              <CompassIcon className="size-4" />
            </button>
            {coachingMenu.isOpen ? (
              <JumpMenu
                activeIndex={coachingMenu.activeIndex}
                onClose={coachingMenu.close}
                onPick={(tab: CoachingTab) => {
                  coachingMenu.close();
                  openCoaching(tab);
                }}
                tabs={coachingTabs}
              />
            ) : null}
          </div>
          <div className="relative">
            <button
              aria-label="Profile"
              className="flex size-6 touch-none items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
              onClick={() => {
                if (settingsMenu.didHold()) {
                  return;
                }

                openSettings("Account");
              }}
              title="Profile. Hold for sections."
              type="button"
              {...settingsMenu.triggerProps}
            >
              <UserCircleIcon className="size-4" />
            </button>
            {settingsMenu.isOpen ? (
              <JumpMenu
                activeIndex={settingsMenu.activeIndex}
                onClose={settingsMenu.close}
                onPick={(tab: SettingsTab) => {
                  settingsMenu.close();
                  openSettings(tab);
                }}
                tabs={settingsTabs}
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
