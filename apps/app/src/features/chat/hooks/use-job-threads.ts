import { useState } from "react";

import { jobById } from "../jobs";

import type { JobStatus } from "../types";

export const useJobThreads = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, JobStatus>>({});

  const open = (id: string) => {
    setStatuses((current) => (id in current ? current : { ...current, [id]: "Suggested" }));
    setOpenId(id);
  };

  return {
    close: () => {
      setOpenId(null);
    },
    open,
    openJob: openId === null ? undefined : jobById(openId),
    setStatus: (id: string, status: JobStatus) => {
      setStatuses((current) => ({ ...current, [id]: status }));
    },
    startedIds: Object.keys(statuses),
    statusOf: (id: string) => statuses[id] ?? "Suggested",
  };
};
