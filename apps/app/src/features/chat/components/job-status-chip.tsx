import type { JobStatus } from "../types";

const tones: Record<JobStatus, string> = {
  Suggested: "border-composer-line text-composer-soft",
  Applied: "border-composer-line bg-composer-track text-composer-ink",
  "Under review": "border-composer-line bg-composer-track text-composer-ink",
  Interviewing: "border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-[#6d3fd4]",
  Rejected: "border-composer-line text-composer-placeholder",
  Accepted: "border-[#2f9e63]/40 bg-[#2f9e63]/10 text-[#237a4c]",
};

interface JobStatusChipProps {
  status: JobStatus;
}

export const JobStatusChip = ({ status }: JobStatusChipProps) => (
  <span
    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap ${tones[status]}`}
  >
    {status}
  </span>
);
