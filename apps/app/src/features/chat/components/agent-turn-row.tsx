import { useState } from "react";

import { CatIcon } from "@solar-icons/react/linear/cat";

import { agentName } from "../data";
import { useRiseIn } from "../hooks/use-rise-in";
import { htmlToText } from "../lib/html-to-text";

import { CopyButton } from "./copy-button";
import { ActionButton, ActionRow } from "./message-actions";

import type { AgentTurn } from "../types";

interface AgentTurnRowProps {
  turn: AgentTurn;
}

export const AgentTurnRow = ({ turn }: AgentTurnRowProps) => {
  const [vote, setVote] = useState<"down" | "up" | null>(null);
  const riseRef = useRiseIn();

  return (
    <div ref={riseRef}>
      <div className="group flex gap-3">
        <span className="shrink-0" title={agentName}>
          <CatIcon className="size-4 text-composer-ink" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="md-body" dangerouslySetInnerHTML={{ __html: turn.html }} />
          {turn.isStreaming ? null : (
            <ActionRow className="-ml-1.5 pt-1.5">
              <div className="flex items-center gap-0.5">
                <CopyButton text={htmlToText(turn.html)} />
                <ActionButton
                  isFilled={vote === "up"}
                  isPressed={vote === "up"}
                  label={vote === "up" ? "Marked helpful" : "Good response"}
                  name="thumbs-up"
                  onClick={() => {
                    setVote(vote === "up" ? null : "up");
                  }}
                />
                <ActionButton
                  isFilled={vote === "down"}
                  isPressed={vote === "down"}
                  label={vote === "down" ? "Marked unhelpful" : "Bad response"}
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
