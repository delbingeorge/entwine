import type { RefObject } from "react";

import { EndCallIcon } from "@solar-icons/react/linear/end-call";
import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";
import { VolumeLoudIcon } from "@solar-icons/react/linear/volume-loud";

import { useElapsed } from "../hooks/use-elapsed";
import { formatElapsed } from "../lib/elapsed";

interface CallWidgetProps {
  agentName: string;
  isMuted: boolean;
  isSilent: boolean;
  onEnd: () => void;
  onOpen: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  rootRef: RefObject<HTMLDivElement | null>;
  startedAt: number;
  status: string;
}

const toggleClass = (isOn: boolean) =>
  `flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
    isOn
      ? "bg-composer-solid text-composer-solid-ink hover:opacity-90"
      : "bg-composer-track text-composer-placeholder hover:text-composer-ink"
  }`;

export const CallWidget = ({
  agentName,
  isMuted,
  isSilent,
  onEnd,
  onOpen,
  onToggleMute,
  onToggleSpeaker,
  rootRef,
  startedAt,
  status,
}: CallWidgetProps) => {
  const seconds = useElapsed(startedAt);

  return (
    <div
      className="fixed right-6 bottom-6 z-40 flex w-[268px] items-center gap-2 rounded-full border border-composer-line bg-composer-surface p-2 font-ui shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
      ref={rootRef}
    >
      <button
        aria-label="Back to the call"
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-2 py-0.5 text-left hover:bg-composer-track"
        onClick={onOpen}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] leading-tight text-composer-ink">
            {agentName}
          </span>
          <span className="block truncate font-mono text-[11px] leading-tight text-composer-placeholder tabular-nums">
            {formatElapsed(seconds)} · {status}
          </span>
        </span>
      </button>

      <button
        aria-label={isMuted ? "Unmute" : "Mute"}
        aria-pressed={!isMuted}
        className={toggleClass(!isMuted)}
        onClick={onToggleMute}
        title={isMuted ? "Unmute" : "Mute"}
        type="button"
      >
        <MicrophoneIcon className="size-4" />
      </button>

      <button
        aria-label={isSilent ? "Turn sound on" : "Turn sound off"}
        aria-pressed={!isSilent}
        className={toggleClass(!isSilent)}
        onClick={onToggleSpeaker}
        title={isSilent ? "Turn sound on" : "Turn sound off"}
        type="button"
      >
        <VolumeLoudIcon className="size-4" />
      </button>

      <button
        aria-label="End the call"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d94f4f] text-white hover:bg-[#c94545]"
        onClick={onEnd}
        title="End the call"
        type="button"
      >
        <EndCallIcon className="size-4" />
      </button>
    </div>
  );
};
