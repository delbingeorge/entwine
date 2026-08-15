import { LucideIcon } from "@/shared/components/lucide-icon";

import { useJobConversation } from "../hooks/use-job-conversation";

import { Composer } from "./composer";
import { JobStatusMenu } from "./job-status-menu";
import { Transcript } from "./transcript";

import type { Job, JobStatus } from "../types";

interface JobThreadProps {
  job: Job;
  onBack: () => void;
  onStatusChange: (status: JobStatus) => void;
  status: JobStatus;
}

export const JobThread = ({ job, onBack, onStatusChange, status }: JobThreadProps) => {
  const chat = useJobConversation(job);

  return (
    <>
      <header className="shrink-0 px-8 pt-2 pb-4 font-ui">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <button
            className="-ml-2 flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-composer-soft hover:bg-composer-track hover:text-composer-ink"
            onClick={onBack}
            type="button"
          >
            <LucideIcon className="size-3.5 shrink-0" name="chevron-left" />
            Back to chat
          </button>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] text-composer-ink">
                {job.title} · {job.company}
              </h1>
              <p className="truncate text-[12.5px] text-composer-soft">
                {job.salary} · {job.location}
              </p>
            </div>
            <JobStatusMenu onChange={onStatusChange} status={status} />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 px-8 pb-4" style={{ gridTemplateRows: "1fr auto" }}>
        <Transcript onRetry={chat.retry} onStartEdit={chat.startEdit} turns={chat.turns} />
        <Composer
          attachment={chat.attachment}
          isBusy={chat.isBusy}
          isEditing={chat.isEditing}
          onCancelEdit={() => {
            chat.setValue("");
            chat.cancelEdit();
          }}
          onFile={() => {
            return;
          }}
          onRemoveAttachment={() => {
            chat.setAttachment(null);
          }}
          onSubmit={chat.submit}
          onValueChange={chat.setValue}
          value={chat.value}
        />
      </div>
    </>
  );
};
