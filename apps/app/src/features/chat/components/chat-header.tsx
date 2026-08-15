import { useState } from "react";

import { HistoryIcon } from "@solar-icons/react/linear/history";
import { UserCircleIcon } from "@solar-icons/react/linear/user-circle";
import { useNavigate } from "@tanstack/react-router";

import { BrandMark } from "@/shared/components/brand-mark";

import { currentThreadId, threads } from "../data";

import { HistoryDialog } from "./history-dialog";

export const ChatHeader = () => {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
            aria-label="Profile"
            className="flex size-6 items-center justify-center rounded-full text-composer-soft transition-colors hover:text-composer-ink"
            onClick={() => {
              void navigate({ to: "/settings" });
            }}
            title="Profile"
            type="button"
          >
            <UserCircleIcon className="size-4" />
          </button>
        </div>
      </header>
      <HistoryDialog
        currentId={currentThreadId}
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
        }}
        onDelete={() => {
          setIsHistoryOpen(false);
        }}
        onNew={() => {
          setIsHistoryOpen(false);
        }}
        onSelect={() => {
          setIsHistoryOpen(false);
        }}
        threads={threads}
      />
    </>
  );
};
