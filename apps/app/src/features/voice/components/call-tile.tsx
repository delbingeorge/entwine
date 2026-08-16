import { VoiceOrb } from "./voice-orb";

interface CallTileProps {
  getLevel: () => number;
  isMuted?: boolean;
  name: string;
  status: string;
}

export const CallTile = ({ getLevel, isMuted, name, status }: CallTileProps) => (
  <div className="flex h-full min-h-0 flex-col items-center justify-center gap-5 rounded-3xl border border-composer-line bg-composer-surface px-6 py-8">
    <VoiceOrb getLevel={getLevel} isMuted={isMuted} />

    <div className="flex flex-col items-center gap-2">
      <p className="text-[17px] font-semibold text-composer-ink">{name}</p>
      <span className="rounded-full bg-composer-track px-3.5 py-1.5 text-[12.5px] text-composer-soft">
        {status}
      </span>
    </div>
  </div>
);
