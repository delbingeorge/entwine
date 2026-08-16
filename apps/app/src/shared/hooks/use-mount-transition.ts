import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface MountTransitionOptions {
  duration?: number;
  hidden?: gsap.TweenVars;
  origin?: string;
}

const defaults = {
  duration: 0.26,
  hidden: { autoAlpha: 0, scale: 0.94, y: 10 } as gsap.TweenVars,
  origin: "center center",
};

export const useMountTransition = (isOpen: boolean, options: MountTransitionOptions = {}) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const ref = useRef<HTMLDivElement>(null);
  const settings = useRef({ ...defaults, ...options });

  settings.current = { ...defaults, ...options };

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const node = ref.current;

    if (node === null) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      if (!isOpen) {
        setIsMounted(false);
      }

      return undefined;
    }

    const { duration, hidden, origin } = settings.current;
    const context = gsap.context(() => {
      gsap.set(node, { transformOrigin: origin });

      if (isOpen) {
        gsap.fromTo(node, hidden, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration,
          ease: "power3.out",
        });

        return;
      }

      gsap.to(node, {
        ...hidden,
        duration: duration * 0.7,
        ease: "power2.in",
        onComplete: () => {
          setIsMounted(false);
        },
      });
    });

    return () => {
      context.revert();
    };
  }, [isMounted, isOpen]);

  return { isMounted, ref };
};
