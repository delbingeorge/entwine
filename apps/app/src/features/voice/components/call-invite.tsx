import { useEffect, useRef } from "react";

import { MicrophoneIcon } from "@solar-icons/react/linear/microphone";
import { gsap } from "gsap";

import { useMountTransition } from "@/shared/hooks/use-mount-transition";
import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface CallInviteProps {
  isVisible: boolean;
  onJoin: () => void;
}

export const CallInvite = ({ isVisible, onJoin }: CallInviteProps) => {
  const { isMounted, ref } = useMountTransition(isVisible, {
    duration: 0.34,
    hidden: { autoAlpha: 0, scale: 0.98, y: 8 },
    origin: "left center",
  });

  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const badge = badgeRef.current;

    if (badge === null || !isMounted || prefersReducedMotion()) {
      return undefined;
    }

    const pulse = gsap.to(badge, {
      scale: 1.08,
      duration: 1.4,
      delay: 0.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      pulse.kill();
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-composer-line bg-composer-surface px-4 py-3"
      ref={ref}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-composer-track text-composer-ink"
        ref={badgeRef}
      >
        <MicrophoneIcon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] text-composer-ink">Practise this out loud</span>
        <span className="block text-[12.5px] text-composer-soft">
          Ellie plays the other side and you answer by speaking.
        </span>
      </span>

      <button
        className="shrink-0 rounded-full bg-composer-solid px-4 py-2 text-[12.5px] text-composer-solid-ink transition-opacity hover:opacity-90"
        onClick={onJoin}
        type="button"
      >
        Join call
      </button>
    </div>
  );
};
