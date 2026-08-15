import { useEffect, useRef } from "react";

import { jobById } from "../jobs";

import { AgentTurnRow } from "./agent-turn-row";
import { JobCard } from "./job-card";
import { ThinkingRow } from "./thinking-row";
import { UserTurnRow } from "./user-turn-row";

import type { JobStatus, Turn } from "../types";

interface TranscriptProps {
  onOpenJob?: (id: string) => void;
  onRetry: (id: number) => void;
  onStartEdit: (turn: Extract<Turn, { role: "user" }>) => void;
  statusOf?: (id: string) => JobStatus;
  turns: Turn[];
}

export const Transcript = ({
  onOpenJob,
  onRetry,
  onStartEdit,
  statusOf,
  turns,
}: TranscriptProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (scroller !== null) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="no-scrollbar min-h-0 overflow-y-auto" ref={scrollerRef}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col gap-6 pt-6 pb-8 font-ui">
          {turns.map((turn) => {
            if (turn.role === "user") {
              return (
                <UserTurnRow
                  key={turn.id}
                  onEdit={() => {
                    onStartEdit(turn);
                  }}
                  turn={turn}
                />
              );
            }

            if (turn.role === "thinking") {
              return <ThinkingRow key={turn.id} />;
            }

            return (
              <div className="flex flex-col gap-3" key={turn.id}>
                <AgentTurnRow
                  onRetry={() => {
                    onRetry(turn.id);
                  }}
                  turn={turn}
                />
                {turn.jobIds === undefined || turn.isStreaming ? null : (
                  <div className="flex flex-col gap-2 pl-7">
                    {turn.jobIds.map((id) => {
                      const job = jobById(id);

                      if (job === undefined) {
                        return null;
                      }

                      return (
                        <JobCard
                          job={job}
                          key={id}
                          onOpen={() => {
                            onOpenJob?.(id);
                          }}
                          status={statusOf?.(id) ?? "Suggested"}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
