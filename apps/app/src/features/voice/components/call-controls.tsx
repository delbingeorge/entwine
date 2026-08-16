import type { ReactNode } from "react";

interface ControlProps {
  isOn?: boolean;
  label: string;
  onClick: () => void;
  tone?: "end" | "primary" | "secondary";
  children: ReactNode;
}

const tones = {
  primary: "bg-composer-solid text-composer-solid-ink hover:opacity-90",
  secondary: "bg-composer-track text-composer-ink hover:bg-composer-line",
  end: "bg-[#d94f4f] text-white hover:bg-[#c94545]",
};

export const Control = ({
  isOn = true,
  label,
  onClick,
  tone = "primary",
  children,
}: ControlProps) => (
  <button
    aria-label={label}
    aria-pressed={tone === "primary" ? isOn : undefined}
    className={`flex size-12 items-center justify-center rounded-full transition-colors ${
      tone === "primary" && !isOn ? tones.secondary : tones[tone]
    }`}
    onClick={onClick}
    title={label}
    type="button"
  >
    {children}
  </button>
);

export const ControlBar = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-2 rounded-3xl border border-composer-line bg-composer-surface px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
    {children}
  </div>
);
