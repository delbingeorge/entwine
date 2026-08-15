import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

const resting = "0 1px 2px rgba(0, 0, 0, 0.04)";
const pulsing = "0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 4px rgba(139, 92, 246, 0.1)";

export const useCardBreathe = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null || prefersReducedMotion()) {
      return undefined;
    }

    if (!isActive) {
      gsap.set(ref.current, { boxShadow: resting });

      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { boxShadow: resting },
        {
          boxShadow: pulsing,
          duration: 1.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    }, ref);

    return () => {
      context.revert();
    };
  }, [isActive]);

  return ref;
};
