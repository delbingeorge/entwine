import { useEffect, useRef } from "react";

const holdDelay = 450;

export const useLongPress = (onLongPress: () => void) => {
  const timer = useRef<number | null>(null);
  const didFire = useRef(false);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clear, []);

  return {
    didLongPress: () => didFire.current,
    handlers: {
      onPointerDown: () => {
        didFire.current = false;
        clear();
        timer.current = window.setTimeout(() => {
          didFire.current = true;
          onLongPress();
        }, holdDelay);
      },
      onPointerLeave: clear,
      onPointerUp: clear,
    },
  };
};
