import type { ReactNode } from "react";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface FadeSwapProps {
  children: ReactNode;
  swapKey: string | number;
}

export const FadeSwap = ({ children, swapKey }: FadeSwapProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion === true) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        exit={{ filter: "blur(6px)", opacity: 0, y: -8 }}
        initial={{ filter: "blur(6px)", opacity: 0, y: 10 }}
        key={swapKey}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
