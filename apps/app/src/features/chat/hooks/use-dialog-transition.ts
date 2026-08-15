import { useEffect, useRef, useState } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

export const useDialogTransition = (isOpen: boolean) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const scrimRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const scrim = scrimRef.current;
    const panel = panelRef.current;

    if (scrim === null || panel === null) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      if (!isOpen) {
        setIsMounted(false);
      }

      return undefined;
    }

    const context = gsap.context(() => {
      if (isOpen) {
        gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" });
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.97, y: -12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" },
        );

        return;
      }

      gsap.to(scrim, { opacity: 0, duration: 0.16, ease: "power2.in" });
      gsap.to(panel, {
        opacity: 0,
        scale: 0.98,
        y: -8,
        duration: 0.16,
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

  return { isMounted, panelRef, scrimRef };
};
