import { LucideIcon } from "@/shared/components/lucide-icon";

import { JobStatusChip } from "./job-status-chip";

import type { Job, JobStatus } from "../types";

interface JobCardProps {
  job: Job;
  onOpen: () => void;
  status: JobStatus;
}

export const JobCard = ({ job, onOpen, status }: JobCardProps) => (
  <button
    className="group flex w-full flex-col gap-2 rounded-xl border border-composer-line bg-composer-surface px-4 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-composer-track"
    onClick={onOpen}
    type="button"
  >
    <span className="flex items-center gap-2">
      <span className="min-w-0 flex-1 truncate text-[14px] text-composer-ink">
        {job.title} · {job.company}
      </span>
      <JobStatusChip status={status} />
      <LucideIcon className="size-3.5 shrink-0 text-composer-placeholder" name="corner-down-left" />
    </span>
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-composer-soft">
      <span>{job.salary}</span>
      <span className="text-composer-line">·</span>
      <span>{job.location}</span>
      <span className="text-composer-line">·</span>
      <span className="font-mono text-[11px] text-composer-placeholder">
        {job.stack.join(", ")}
      </span>
    </span>
  </button>
);
