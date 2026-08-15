import { useEffect, useRef } from "react";

import { gsap } from "gsap";

import { BrandMark } from "@/shared/components/brand-mark";
import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface SigningInProps {
  failure: string | null;
}

export const SigningIn = ({ failure }: SigningInProps) => {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markRef.current === null || failure !== null || prefersReducedMotion()) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.to(markRef.current, {
        opacity: 0.4,
        scale: 1.04,
        duration: 1.1,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, markRef);

    return () => {
      context.revert();
    };
  }, [failure]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6">
      <div ref={markRef}>
        <BrandMark />
      </div>
      {failure === null ? null : (
        <p className="text-center text-sm text-ink-muted" role="alert">
          {failure}
        </p>
      )}
    </main>
  );
};
