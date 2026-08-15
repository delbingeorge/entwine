import { useEffect, useRef, useState } from "react";

import { ActionButton } from "./message-actions";

type CopyState = "copied" | "failed" | "idle";

const labels: Record<CopyState, string> = {
  copied: "Copied",
  failed: "Copy is unavailable here",
  idle: "Copy",
};

const icons = { copied: "check", failed: "x", idle: "copy" } as const;

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch (cause) {
      console.error("copy failed", cause);
      setState("failed");
    }

    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      setState("idle");
    }, 1200);
  };

  return (
    <ActionButton
      isHighlighted={state === "copied"}
      label={labels[state]}
      name={icons[state]}
      onClick={() => {
        void copy();
      }}
    />
  );
};
