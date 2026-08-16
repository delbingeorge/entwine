import { useEffect, useRef } from "react";

import { pressMenuItemAttribute } from "@/shared/hooks/use-press-menu";

interface JumpMenuProps<T extends string> {
  activeIndex: number;
  onClose: () => void;
  onPick: (tab: T) => void;
  tabs: readonly T[];
}

export const JumpMenu = <T extends string>({
  activeIndex,
  onClose,
  onPick,
  tabs,
}: JumpMenuProps<T>) => {
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
      className="absolute top-full right-0 z-50 mt-2 w-[220px] overflow-hidden rounded-2xl border border-composer-line bg-composer-surface py-2 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
      ref={ref}
      role="menu"
    >
      <p className="px-4 pt-1 pb-2 text-[10px] tracking-widest text-composer-placeholder">
        JUMP TO
      </p>
      {tabs.map((tab, index) => (
        <button
          className={`flex w-full items-center px-4 py-2 text-left text-[14px] text-composer-ink hover:bg-composer-track ${
            index === activeIndex ? "bg-composer-track" : ""
          }`}
          key={tab}
          onClick={() => {
            onPick(tab);
          }}
          role="menuitem"
          type="button"
          {...{ [pressMenuItemAttribute]: index }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
