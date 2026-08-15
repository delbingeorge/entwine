import { LucideIcon } from "@/shared/components/lucide-icon";

import { kindIcon } from "../lib/classify-file";

import type { Attachment } from "../types";

interface ChipLeadProps {
  attachment: Attachment;
}

const ChipLead = ({ attachment }: ChipLeadProps) => {
  if (attachment.kind === "image") {
    return (
      <span
        className="size-[18px] shrink-0 rounded-md"
        style={{
          background:
            attachment.url === undefined ? "#a8d8f8" : `center/cover url('${attachment.url}')`,
        }}
      />
    );
  }

  return (
    <LucideIcon className="size-4 shrink-0 text-composer-soft" name={kindIcon[attachment.kind]} />
  );
};

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove?: () => void;
}

export const AttachmentChip = ({ attachment, onRemove }: AttachmentChipProps) => (
  <div
    className="flex h-8 items-center gap-2 rounded-full border border-composer-line bg-composer-surface pr-1.5 pl-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    style={{ maxWidth: "280px" }}
  >
    <ChipLead attachment={attachment} />
    <span className="min-w-0 flex-1 truncate text-[13px] text-composer-ink">{attachment.name}</span>
    {onRemove === undefined ? null : (
      <button
        aria-label={`Remove ${attachment.name}`}
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-composer-soft hover:bg-composer-track hover:text-composer-ink"
        onClick={onRemove}
        type="button"
      >
        <LucideIcon className="size-3.5" name="x" strokeWidth={2} />
      </button>
    )}
  </div>
);

interface SentChipProps {
  attachment: Attachment;
}

export const SentChip = ({ attachment }: SentChipProps) => (
  <div
    className="flex h-8 items-center gap-2 rounded-full border border-composer-line bg-composer-surface px-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    style={{ maxWidth: "280px" }}
  >
    <ChipLead attachment={attachment} />
    <span className="min-w-0 flex-1 truncate text-[13px] text-composer-ink">{attachment.name}</span>
  </div>
);
