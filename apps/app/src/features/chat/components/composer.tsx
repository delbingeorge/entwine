import { useRef, useState } from "react";

import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";

import { LucideIcon } from "@/shared/components/lucide-icon";

import { useCardBreathe } from "../hooks/use-card-breathe";
import { useRiseIn } from "../hooks/use-rise-in";

import { AttachmentChip } from "./attachment-chip";
import { ComposerField } from "./composer-field";

import type { Attachment } from "../types";

interface ComposerProps {
  attachment: Attachment | null;
  canCall?: boolean;
  isBusy: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  onFile: (file: File | undefined) => void;
  onJoinCall?: () => void;
  placeholder: string;
  onRemoveAttachment: () => void;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  value: string;
}

export const Composer = ({
  attachment,
  canCall = false,
  isBusy,
  isEditing,
  onCancelEdit,
  onFile,
  onJoinCall,
  onRemoveAttachment,
  onSubmit,
  onValueChange,
  placeholder,
  value,
}: ComposerProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDropping, setIsDropping] = useState(false);
  const riseRef = useRiseIn();
  const cardRef = useCardBreathe(isBusy);

  const isPlated = attachment !== null || isEditing;
  const canSend = isBusy || value.trim().length > 0 || attachment !== null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        className={`relative pt-5 font-ui ${isDropping ? "rounded-[18px] outline-2 outline-offset-[6px] outline-dashed outline-[#4a4aff]" : ""}`}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDropping(false);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDropping(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDropping(false);
          onFile(event.dataTransfer.files[0]);
        }}
        ref={wrapRef}
      >
        <div ref={riseRef}>
          <div className={`rounded-[18px] ${isPlated ? "bg-composer-shell" : ""}`}>
            {isEditing ? (
              <div className="flex items-center gap-2 rounded-t-2xl bg-composer-shell px-4 py-2">
                <LucideIcon className="size-4 shrink-0 text-composer-soft" name="pencil" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-composer-soft">
                  Editing a sent message
                </span>
                <button
                  className="shrink-0 rounded-full border border-composer-line bg-composer-surface px-3 py-1 text-[12.5px] text-composer-soft hover:text-composer-ink"
                  onClick={onCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            {attachment === null ? null : (
              <div className="flex gap-2 overflow-x-auto px-2 py-2">
                <div className="shrink-0">
                  <AttachmentChip attachment={attachment} onRemove={onRemoveAttachment} />
                </div>
              </div>
            )}

            <div
              className="rounded-xl border border-composer-line bg-composer-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              ref={cardRef}
            >
              <ComposerField
                placeholder={placeholder}
                isDisabled={isBusy}
                onChange={onValueChange}
                onSubmit={onSubmit}
                value={value}
              />
              <div className="pt-2.5">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Attach a file"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-composer-line bg-composer-surface text-composer-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] enabled:hover:bg-composer-track disabled:opacity-40"
                    disabled={isBusy}
                    onClick={() => {
                      fileRef.current?.click();
                    }}
                    title={attachment === null ? "Attach a file" : "Replace the attachment"}
                    type="button"
                  >
                    <LucideIcon className="size-4" name="paperclip" />
                  </button>
                  <input
                    className="hidden"
                    onChange={(event) => {
                      onFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    ref={fileRef}
                    type="file"
                  />
                  {canCall ? (
                    <button
                      className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-composer-line bg-composer-surface px-3 text-[12.5px] text-composer-ink transition-colors hover:bg-composer-track"
                      onClick={onJoinCall}
                      title="Practise out loud with Ellie"
                      type="button"
                    >
                      <MicrophoneIcon className="size-4" />
                      Join call
                    </button>
                  ) : null}
                  <button
                    aria-label={isBusy ? "Stop generating" : "Send message"}
                    className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-composer-solid text-composer-solid-ink disabled:opacity-30"
                    disabled={!canSend}
                    onClick={onSubmit}
                    type="button"
                  >
                    {isBusy ? (
                      <svg
                        aria-hidden="true"
                        className="size-3.5 fill-current"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                      </svg>
                    ) : (
                      <LucideIcon className="size-4" name="arrow-up" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {canCall ? (
            <p className="pt-2 text-center text-[12.5px] leading-relaxed text-composer-soft">
              Remember, voice calls use whatever's already in this chat, so paste the JD or other
              details to continue.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
