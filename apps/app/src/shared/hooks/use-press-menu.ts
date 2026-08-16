import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const holdDelay = 400;

export const pressMenuItemAttribute = "data-press-menu-index";

const indexUnderPointer = (x: number, y: number) => {
  const target = document.elementFromPoint(x, y);
  const item = target?.closest(`[${pressMenuItemAttribute}]`);
  const raw = item?.getAttribute(pressMenuItemAttribute);

  return raw === null || raw === undefined ? -1 : Number(raw);
};

export const usePressMenu = (onSelect: (index: number) => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);
  const didHold = useRef(false);
  const active = useRef(-1);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const setActive = (index: number) => {
    active.current = index;
    setActiveIndex(index);
  };

  const close = () => {
    setIsOpen(false);
    setActive(-1);
  };

  const release = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (triggerRef.current?.hasPointerCapture(event.pointerId) === true) {
      triggerRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return {
    activeIndex,
    close,
    didHold: () => didHold.current,
    isOpen,
    triggerProps: {
      onContextMenu: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
      onPointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => {
        clearTimer();
        release(event);
        close();
      },
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        didHold.current = false;
        setActive(-1);
        clearTimer();
        triggerRef.current?.setPointerCapture(event.pointerId);

        timer.current = window.setTimeout(() => {
          didHold.current = true;
          setIsOpen(true);
        }, holdDelay);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (!didHold.current) {
          return;
        }

        const index = indexUnderPointer(event.clientX, event.clientY);

        if (index !== active.current) {
          setActive(index);
        }
      },
      onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
        clearTimer();
        release(event);

        if (!didHold.current) {
          return;
        }

        const chosen = active.current;

        if (chosen >= 0) {
          close();
          onSelect(chosen);
        }
      },
      ref: triggerRef,
    },
  };
};
