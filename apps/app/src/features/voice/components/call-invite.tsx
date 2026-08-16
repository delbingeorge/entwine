import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";

interface CallInviteProps {
  onJoin: () => void;
}

export const CallInvite = ({ onJoin }: CallInviteProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-composer-line bg-composer-surface px-4 py-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-composer-track text-composer-ink">
      <MicrophoneIcon className="size-4" />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-[13.5px] text-composer-ink">Practise this out loud</span>
      <span className="block text-[12.5px] text-composer-soft">
        Ellie plays the other side and you answer by speaking.
      </span>
    </span>

    <button
      className="shrink-0 rounded-full bg-composer-solid px-4 py-2 text-[12.5px] text-composer-solid-ink transition-opacity hover:opacity-90"
      onClick={onJoin}
      type="button"
    >
      Join call
    </button>
  </div>
);
