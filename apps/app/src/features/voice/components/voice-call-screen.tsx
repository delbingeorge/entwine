import type { RefObject } from "react";

import { EndCallIcon } from "@solar-icons/react/linear/end-call";
import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";
import { VolumeCrossIcon } from "@solar-icons/react/linear/volume-cross";
import { VolumeLoudIcon } from "@solar-icons/react/linear/volume-loud";

import { LucideIcon } from "@/shared/components/lucide-icon";

import { useElapsed } from "../hooks/use-elapsed";
import { formatElapsed } from "../lib/elapsed";

import { Control, ControlBar } from "./call-controls";
import { VoiceOrb } from "./voice-orb";

import type { LiveStatus } from "../hooks/use-live-call";

interface VoiceCallScreenProps {
  agentName: string;
  getLevel: () => number;
  caption: string;
  isMuted: boolean;
  isSilent: boolean;
  onEnd: () => void;
  onMinimise: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  rootRef: RefObject<HTMLDivElement | null>;
  startedAt: number;
  status: LiveStatus;
  topic: string;
}

export const VoiceCallScreen = ({
  agentName,
  getLevel,
  caption,
  isMuted,
  isSilent,
  onEnd,
  onMinimise,
  onToggleMute,
  onToggleSpeaker,
  rootRef,
  startedAt,
  status,
  topic,
}: VoiceCallScreenProps) => {
  const seconds = useElapsed(startedAt);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface font-ui" ref={rootRef}>
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="-ml-2 flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-composer-soft hover:bg-composer-track hover:text-composer-ink"
            onClick={onMinimise}
            type="button"
          >
            <LucideIcon className="size-3.5 shrink-0" name="chevron-left" />
            Back to chat
          </button>
          <span className="min-w-0 truncate text-[13px] text-composer-ink">{topic}</span>
        </div>

        <span className="shrink-0 font-mono text-[15px] text-composer-soft">
          {formatElapsed(seconds)}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5">
        <VoiceOrb getLevel={getLevel} />

        <p className="text-[20px] font-semibold text-composer-ink">{agentName}</p>

        <span className="rounded-full bg-composer-track px-4 py-2 text-[14px] text-composer-soft">
          {status}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-5 px-6 pb-8">
        {caption === "" ? null : (
          <p className="max-w-2xl rounded-xl bg-composer-track px-5 py-4 text-center text-[16px] leading-relaxed text-composer-ink">
            {caption}
          </p>
        )}

        <ControlBar>
          <Control isOn={!isMuted} label={isMuted ? "Unmute" : "Mute"} onClick={onToggleMute}>
            <MicrophoneIcon className="size-5" />
          </Control>

          <Control
            isOn={!isSilent}
            label={isSilent ? "Turn sound on" : "Turn sound off"}
            onClick={onToggleSpeaker}
          >
            {isSilent ? (
              <VolumeCrossIcon className="size-5" />
            ) : (
              <VolumeLoudIcon className="size-5" />
            )}
          </Control>

          <Control label="End the call" onClick={onEnd} tone="end">
            <EndCallIcon className="size-5" />
          </Control>
        </ControlBar>
      </div>
    </div>
  );
};
