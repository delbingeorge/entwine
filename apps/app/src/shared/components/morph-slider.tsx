import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

import { MorphCaptions, MorphControls, MorphIndicators } from "./morph-slider-chrome";
import { MorphEngine } from "./morph-slider-engine";

import type { MorphItem, MorphOptions } from "./morph-slider-scene";

interface MorphSliderProps extends Partial<MorphOptions> {
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  items: MorphItem[];
  radius?: number;
  showCaptions?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  startIndex?: number;
}

export const MorphSlider = ({
  aberration = 0.35,
  autoplay = false,
  autoplayDelay = 4,
  className = "",
  drift = 0.4,
  duration = 1.1,
  ease = "power2.inOut",
  intensity = 0.55,
  items,
  loop = true,
  overlayColor = "#000000",
  radius = 16,
  scale = 2.4,
  showCaptions = true,
  showControls = true,
  showIndicators = true,
  startIndex = 0,
  transition = "melt",
}: MorphSliderProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [isHovering, setIsHovering] = useState(false);

  const optionsRef = useRef<MorphOptions>({
    aberration,
    drift,
    duration,
    ease,
    intensity,
    loop,
    overlayColor,
    scale,
    transition,
  });

  optionsRef.current = {
    aberration,
    drift,
    duration,
    ease,
    intensity,
    loop,
    overlayColor,
    scale,
    transition,
  };

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const sources = items.map((item) => item.image).join("|");

  useEffect(() => {
    const stage = stageRef.current;

    if (stage === null) {
      return undefined;
    }

    const engine = new MorphEngine(stage, {
      getOptions: () => optionsRef.current,
      items: itemsRef.current,
      onIndexChange: setIndex,
      reducedMotion: prefersReducedMotion(),
      startIndex,
    });

    engineRef.current = engine;
    setIndex(startIndex);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [sources, startIndex]);

  const goNext = useCallback(() => {
    engineRef.current?.goTo(1);
  }, []);

  const goPrevious = useCallback(() => {
    engineRef.current?.goTo(-1);
  }, []);

  useEffect(() => {
    if (!autoplay || isHovering) {
      return undefined;
    }

    const timer = setTimeout(goNext, Math.max(autoplayDelay, 1) * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [autoplay, autoplayDelay, goNext, index, isHovering]);

  useEffect(() => {
    const stage = stageRef.current;

    if (stage === null) {
      return undefined;
    }

    let startX = 0;
    let width = 1;
    let isActive = false;

    const onPointerDown = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      width = rect.width || 1;
      startX = event.clientX;
      engineRef.current?.setPointer(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      );
      isActive = engineRef.current?.beginDrag() ?? false;

      if (isActive) {
        stage.setPointerCapture(event.pointerId);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isActive) {
        engineRef.current?.drag((event.clientX - startX) / width);
      }
    };

    const onPointerUp = () => {
      if (isActive) {
        isActive = false;
        engineRef.current?.endDrag();
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    return () => {
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const hasCaptions = items.some((item) => item.caption !== undefined);

  return (
    <div
      className={cn(
        "relative size-full touch-pan-y overflow-hidden bg-[#0c0c0e] select-none",
        className,
      )}
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      style={{ borderRadius: `${String(radius)}px` }}
    >
      <div
        aria-label="Image morph slider"
        aria-roledescription="carousel"
        className="absolute inset-0 cursor-grab outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-white/70 active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrevious();
          }
        }}
        ref={stageRef}
        role="group"
        tabIndex={0}
      />

      {showCaptions && hasCaptions ? (
        <MorphCaptions activeIndex={index} items={items} swapSeconds={duration} />
      ) : null}

      {showControls ? <MorphControls onNext={goNext} onPrevious={goPrevious} /> : null}

      {showIndicators ? (
        <MorphIndicators
          activeIndex={index}
          count={items.length}
          dotSeconds={duration}
          onSelect={(target) => {
            if (target !== index) {
              engineRef.current?.goTo(target > index ? 1 : -1);
            }
          }}
        />
      ) : null}
    </div>
  );
};
