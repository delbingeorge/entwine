import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

export const useRiseIn = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null || prefersReducedMotion()) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 10,
        duration: 0.56,
        ease: "power4.out",
      });
    }, ref);

    return () => {
      context.revert();
    };
  }, []);

  return ref;
};
