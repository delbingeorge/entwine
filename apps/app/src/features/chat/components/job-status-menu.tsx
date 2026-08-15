import { useEffect, useRef, useState } from "react";

import { LucideIcon } from "@/shared/components/lucide-icon";

import { jobStatuses, type JobStatus } from "../types";

import { JobStatusChip } from "./job-status-chip";

interface JobStatusMenuProps {
  onChange: (status: JobStatus) => void;
  status: JobStatus;
}

export const JobStatusMenu = ({ onChange, status }: JobStatusMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", close);

    return () => {
      document.removeEventListener("click", close);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-full px-1 py-0.5 hover:bg-composer-track"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        <JobStatusChip status={status} />
        <LucideIcon
          className="size-3.5 shrink-0 text-composer-placeholder"
          name="chevron-down"
          strokeWidth={2}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-[190px] overflow-hidden rounded-xl border border-composer-line bg-composer-surface py-1 shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
          role="listbox"
        >
          {jobStatuses.map((entry) => (
            <button
              aria-selected={entry === status}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-composer-ink hover:bg-composer-track"
              key={entry}
              onClick={() => {
                onChange(entry);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              <span className="min-w-0 flex-1 truncate">{entry}</span>
              {entry === status ? (
                <LucideIcon
                  className="size-3.5 shrink-0 text-composer-ink"
                  name="check"
                  strokeWidth={2}
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
