import { useEffect, useRef } from "react";

import { CatIcon } from "@solar-icons/react/linear/cat";
import { gsap } from "gsap";

import { agentName } from "../data";
import { useRiseIn } from "../hooks/use-rise-in";
import { prefersReducedMotion } from "../lib/reduced-motion";

export const ThinkingRow = () => {
  const riseRef = useRiseIn();
  const dotsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (dotsRef.current === null || prefersReducedMotion()) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.to("[data-dot]", {
        keyframes: [
          { opacity: 0.25, y: 0, duration: 0 },
          { opacity: 1, y: -2, duration: 0.49, ease: "sine.inOut" },
          { opacity: 0.25, y: 0, duration: 0.49, ease: "sine.inOut" },
          { opacity: 0.25, y: 0, duration: 0.42 },
        ],
        repeat: -1,
        stagger: 0.16,
      });
    }, dotsRef);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <div ref={riseRef}>
      <div className="flex gap-3">
        <CatIcon className="mt-1 size-4 shrink-0 text-composer-ink" />
        <p className="flex items-center gap-2 text-[14px] text-composer-soft">
          {agentName} is thinking
          <span className="flex items-center gap-1" ref={dotsRef}>
            <span className="size-1 rounded-full bg-composer-soft opacity-25" data-dot />
            <span className="size-1 rounded-full bg-composer-soft opacity-25" data-dot />
            <span className="size-1 rounded-full bg-composer-soft opacity-25" data-dot />
          </span>
        </p>
      </div>
    </div>
  );
};
