import { useEffect, useRef } from "react";

import { UserIcon } from "@solar-icons/react/linear/user";
import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface VoiceOrbProps {
  getLevel: () => number;
  isMuted?: boolean;
}

const innerSpread = 0.34;
const outerSpread = 0.62;

export const VoiceOrb = ({ getLevel, isMuted = false }: VoiceOrbProps) => {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const core = coreRef.current;

    if (outer === null || inner === null || core === null || prefersReducedMotion()) {
      return undefined;
    }

    const scaleOuter = gsap.quickTo(outer, "scale", { duration: 0.35, ease: "power2.out" });
    const fadeOuter = gsap.quickTo(outer, "opacity", { duration: 0.35, ease: "power2.out" });
    const scaleInner = gsap.quickTo(inner, "scale", { duration: 0.22, ease: "power2.out" });
    const fadeInner = gsap.quickTo(inner, "opacity", { duration: 0.22, ease: "power2.out" });
    const scaleCore = gsap.quickTo(core, "scale", { duration: 0.18, ease: "power2.out" });

    let frame = 0;

    const follow = () => {
      const level = isMuted ? 0 : getLevel();

      scaleOuter(1 + level * outerSpread);
      fadeOuter(0.06 + level * 0.3);
      scaleInner(1 + level * innerSpread);
      fadeInner(0.1 + level * 0.45);
      scaleCore(1 + level * 0.06);

      frame = requestAnimationFrame(follow);
    };

    frame = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(frame);
      gsap.set([outer, inner, core], { clearProps: "all" });
    };
  }, [getLevel, isMuted]);

  return (
    <div className="relative flex size-[248px] items-center justify-center">
      <span
        className="absolute size-[248px] rounded-full bg-composer-track opacity-[0.06]"
        ref={outerRef}
      />
      <span
        className="absolute size-[214px] rounded-full bg-composer-track opacity-10"
        ref={innerRef}
      />
      <div
        className="relative flex size-[186px] items-center justify-center rounded-full bg-composer-track"
        ref={coreRef}
      >
        <UserIcon className="size-20 text-composer-placeholder" />
      </div>
    </div>
  );
};
