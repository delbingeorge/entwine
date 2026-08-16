import { ChatRoundIcon } from "@solar-icons/react/linear/chat-round";

import { JobStatusChip } from "./job-status-chip";

import type { Job, JobStatus } from "../types";

interface HistoryJobsProps {
  jobs: { job: Job; status: JobStatus }[];
  onOpenJob: (id: string) => void;
}

export const HistoryJobs = ({ jobs, onOpenJob }: HistoryJobsProps) => {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="px-4 pt-2.5 pb-1 text-[10px] tracking-widest text-composer-placeholder">JOBS</p>
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
  );
};
