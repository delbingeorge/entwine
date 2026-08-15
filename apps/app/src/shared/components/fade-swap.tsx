import { useLayoutEffect, useRef, type ReactNode } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface FadeSwapProps {
  children: ReactNode;
  swapKey: number | string;
}

export const FadeSwap = ({ children, swapKey }: FadeSwapProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (root === null || prefersReducedMotion()) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        root,
        { autoAlpha: 0, filter: "blur(6px)", y: 10 },
        { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.32, ease: "power3.out" },
      );
    }, root);

    return () => {
      context.revert();
    };
  }, [swapKey]);

  return <div ref={rootRef}>{children}</div>;
};
