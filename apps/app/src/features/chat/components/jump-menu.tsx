import { useEffect, useRef } from "react";

import { settingsTabs, type SettingsTab } from "@/shared/lib/settings-tabs";

interface JumpMenuProps {
  onClose: () => void;
  onPick: (tab: SettingsTab) => void;
}

export const JumpMenu = ({ onClose, onPick }: JumpMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: Event) => {
      if (ref.current !== null && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="absolute top-full right-0 z-50 mt-2 w-[220px] overflow-hidden rounded-2xl border border-composer-line bg-composer-surface py-2 shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
      ref={ref}
      role="menu"
    >
      <p className="px-4 pt-1 pb-2 text-[10px] tracking-widest text-composer-placeholder">
        JUMP TO
      </p>
      {settingsTabs.map((tab) => (
        <button
          className="flex w-full items-center px-4 py-2 text-left text-[14px] text-composer-ink hover:bg-composer-track"
          key={tab}
          onClick={() => {
            onPick(tab);
          }}
          role="menuitem"
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
