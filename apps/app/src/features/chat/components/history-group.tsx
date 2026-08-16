import type { ThreadSummary } from "@/shared/lib/thread-api";

import { HistoryRow } from "./history-row";

interface HistoryGroupProps {
  activeIndex: number;
  currentId: string;
  emptyLabel?: string;
  label: string;
  offset: number;
  onDelete: (id: string) => void;
  onHover: (index: number) => void;
  onSelect: (id: string) => void;
  rowId: (index: number) => string;
  threads: ThreadSummary[];
}

export const HistoryGroup = ({
  activeIndex,
  currentId,
  emptyLabel,
  label,
  offset,
  onDelete,
  onHover,
  onSelect,
  rowId,
  threads,
}: HistoryGroupProps) => (
  <div>
    <p className="px-4 pt-2.5 pb-1 text-[10px] tracking-widest text-composer-placeholder">
      {label}
    </p>
    {threads.length === 0 ? (
      <p className="px-4 py-3 text-[12.5px] text-composer-placeholder">{emptyLabel}</p>
    ) : (
      threads.map((thread, position) => {
        const index = offset + position;

        return (
          <HistoryRow
            id={rowId(index)}
            isActive={index === activeIndex}
            isCurrent={thread.id === currentId}
            key={thread.id}
            onDelete={() => {
              onDelete(thread.id);
            }}
            onHover={() => {
              onHover(index);
            }}
            onSelect={() => {
              onSelect(thread.id);
            }}
            thread={thread}
          />
        );
      })
    )}
  </div>
);
