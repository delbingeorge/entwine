import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

const charsPerSecond = 90;
const maxCatchUp = 1.2;

export const createReveal = (onFrame: (count: number) => void) => {
  const state = { count: 0 };
  let tween: gsap.core.Tween | null = null;

  const jumpTo = (target: number) => {
    tween?.kill();
    tween = null;
    state.count = target;
    onFrame(target);
  };

  const glideTo = (target: number, onComplete?: () => void) => {
    if (target <= state.count) {
      onComplete?.();
      return;
    }

    tween?.kill();
    tween = gsap.to(state, {
      count: target,
      duration: Math.min((target - state.count) / charsPerSecond, maxCatchUp),
      ease: "none",
      onComplete,
      onUpdate: () => {
        onFrame(Math.floor(state.count));
      },
    });
  };

  return {
    kill: () => {
      tween?.kill();
      tween = null;
    },
    settle: (target: number) =>
      new Promise<void>((resolve) => {
        if (prefersReducedMotion()) {
          jumpTo(target);
          resolve();

          return;
        }

        glideTo(target, () => {
          jumpTo(target);
          resolve();
        });
      }),
    to: (target: number) => {
      if (prefersReducedMotion()) {
        jumpTo(target);
        return;
      }

      glideTo(target);
    },
  };
};
