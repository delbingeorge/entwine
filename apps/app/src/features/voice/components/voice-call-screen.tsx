import type { RefObject } from "react";

import { ChatRoundIcon } from "@solar-icons/react/linear/chat-round";
import { KeyboardIcon } from "@solar-icons/react/linear/keyboard";
import { MenuDotsIcon } from "@solar-icons/react/linear/menu-dots";
import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";
import { UserIcon } from "@solar-icons/react/linear/user";
import { VolumeLoudIcon } from "@solar-icons/react/linear/volume-loud";

import { LucideIcon } from "@/shared/components/lucide-icon";

import { useElapsed } from "../hooks/use-elapsed";
import { formatElapsed } from "../lib/elapsed";

import { Control, ControlBar } from "./call-controls";

export type CallStatus = "Connecting" | "Listening" | "Speaking";

interface VoiceCallScreenProps {
  agentName: string;
  caption: string;
  isMuted: boolean;
  isSilent: boolean;
  onEnd: () => void;
  onMinimise: () => void;
  onShowTranscript: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  rootRef: RefObject<HTMLDivElement | null>;
  startedAt: number;
  status: CallStatus;
  topic: string;
}

export const VoiceCallScreen = ({
  agentName,
  caption,
  isMuted,
  isSilent,
  onEnd,
  onMinimise,
  onShowTranscript,
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
        <div className="flex size-[248px] items-center justify-center rounded-[28px] bg-composer-track">
          <UserIcon className="size-24 text-composer-placeholder" />
        </div>

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
          <button
            aria-label="More options"
            className="flex size-8 items-center justify-center text-composer-placeholder hover:text-composer-ink"
            type="button"
          >
            <MenuDotsIcon className="size-5" />
          </button>

          <Control isOn={!isMuted} label={isMuted ? "Unmute" : "Mute"} onClick={onToggleMute}>
            <MicrophoneIcon className="size-5" />
          </Control>

          <Control
            isOn={!isSilent}
            label={isSilent ? "Turn sound on" : "Turn sound off"}
            onClick={onToggleSpeaker}
          >
            <VolumeLoudIcon className="size-5" />
          </Control>

          <Control label="Type instead" onClick={onShowTranscript}>
            <KeyboardIcon className="size-5" />
          </Control>

          <Control label="Show the transcript" onClick={onShowTranscript} tone="secondary">
            <ChatRoundIcon className="size-5" />
          </Control>

          <Control label="End the call" onClick={onEnd} tone="end">
            <LucideIcon className="size-5" name="x" strokeWidth={2.5} />
          </Control>
        </ControlBar>
      </div>
    </div>
  );
};
