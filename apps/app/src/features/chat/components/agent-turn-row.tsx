import { useState } from "react";

import { CatIcon } from "@solar-icons/react/linear/cat";

import { agentName } from "../data";
import { useRiseIn } from "../hooks/use-rise-in";

import { ActionButton, ActionRow } from "./message-actions";

import type { AgentTurn } from "../types";

interface AgentTurnRowProps {
  onCopy: () => void;
  onRetry: () => void;
  turn: AgentTurn;
}

export const AgentTurnRow = ({ onCopy, onRetry, turn }: AgentTurnRowProps) => {
  const [vote, setVote] = useState<"down" | "up" | null>(null);
  const riseRef = useRiseIn();

  return (
    <div ref={riseRef}>
      <div className="group flex gap-3">
        <span className="mt-1 shrink-0" title={agentName}>
          <CatIcon className="size-4 text-composer-ink" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="md-body" dangerouslySetInnerHTML={{ __html: turn.html }} />
          {turn.isStreaming ? null : (
            <ActionRow className="-ml-1.5 pt-1.5">
              <div className="flex items-center gap-0.5">
                <ActionButton label="Copy" name="copy" onClick={onCopy} />
                <ActionButton label="Try again" name="refresh-cw" onClick={onRetry} />
                <ActionButton
                  isPressed={vote === "up"}
                  label="Good response"
                  name="thumbs-up"
                  onClick={() => {
                    setVote(vote === "up" ? null : "up");
                  }}
                />
                <ActionButton
                  isPressed={vote === "down"}
                  label="Bad response"
                  name="thumbs-down"
                  onClick={() => {
                    setVote(vote === "down" ? null : "down");
                  }}
                />
              </div>
            </ActionRow>
          )}
        </div>
      </div>
    </div>
  );
};
