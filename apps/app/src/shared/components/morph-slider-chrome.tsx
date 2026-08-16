import { cn } from "@/shared/lib/cn";

import type { MorphItem } from "./morph-slider-scene";

interface CaptionsProps {
  activeIndex: number;
  items: MorphItem[];
  swapSeconds: number;
}

interface ControlsProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface IndicatorsProps {
  activeIndex: number;
  count: number;
  dotSeconds: number;
  onSelect: (index: number) => void;
}

const buttonClass =
  "pointer-events-auto inline-flex size-10 items-center justify-center rounded-full border " +
  "border-white/20 bg-[#0c0c0e]/40 text-white backdrop-blur-lg transition " +
  "hover:scale-105 hover:border-white/50 hover:bg-[#18181c]/60 active:scale-95";

export const MorphCaptions = ({ activeIndex, items, swapSeconds }: CaptionsProps) => (
  <div
    aria-live="polite"
    className="pointer-events-none absolute bottom-6 left-6 z-2 grid max-w-[70%]"
  >
    {items.map((item, index) =>
      item.caption === undefined ? null : (
        <span
          aria-hidden={index === activeIndex ? undefined : true}
          className={cn(
            "col-start-1 row-start-1 justify-self-start rounded-[10px] bg-[#0a0a0c]/40 px-3.5 py-2",
            "text-[15px] font-semibold text-white backdrop-blur-lg",
            "transition-[opacity,transform,filter] ease-[cubic-bezier(0.16,1,0.3,1)]",
            index === activeIndex
              ? "translate-y-0 opacity-100 blur-none"
              : "translate-y-3 opacity-0 blur-[6px]",
          )}
          key={item.image}
          style={{ transitionDuration: `${(swapSeconds * 0.66).toFixed(3)}s` }}
        >
          {item.caption}
        </span>
      ),
    )}
  </div>
);

export const MorphControls = ({ onNext, onPrevious }: ControlsProps) => (
  <div className="pointer-events-none absolute inset-x-0 top-1/2 z-3 flex -translate-y-1/2 justify-between px-4">
    <button aria-label="Previous slide" className={buttonClass} onClick={onPrevious} type="button">
      <svg aria-hidden height="18" viewBox="0 0 24 24" width="18">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
    <button aria-label="Next slide" className={buttonClass} onClick={onNext} type="button">
      <svg aria-hidden height="18" viewBox="0 0 24 24" width="18">
        <path
          d="M9 5l7 7-7 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  </div>
);

export const MorphIndicators = ({ activeIndex, count, dotSeconds, onSelect }: IndicatorsProps) => (
  <div
    aria-label="Slides"
    className="absolute inset-x-0 bottom-4 z-3 flex items-center justify-center gap-2"
    role="tablist"
  >
    {Array.from({ length: count }, (_unused, index) => (
      <button
        aria-label={`Go to slide ${String(index + 1)}`}
        aria-selected={index === activeIndex}
        className={cn(
          "h-2 rounded-full transition-[width,background-color] ease-[cubic-bezier(0.16,1,0.3,1)]",
          index === activeIndex ? "w-[22px] bg-white/95" : "w-2 bg-white/35",
        )}
        key={index}
        onClick={() => {
          onSelect(index);
        }}
        role="tab"
        style={{ transitionDuration: `${(dotSeconds * 0.45).toFixed(3)}s` }}
        type="button"
      />
    ))}
  </div>
);
