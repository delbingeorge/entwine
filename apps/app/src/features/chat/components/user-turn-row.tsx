import { useRiseIn } from "../hooks/use-rise-in";

import { SentChip } from "./attachment-chip";
import { ActionButton, ActionRow } from "./message-actions";

import type { UserTurn } from "../types";

interface UserTurnRowProps {
  onCopy: () => void;
  onEdit: () => void;
  turn: UserTurn;
}

export const UserTurnRow = ({ onCopy, onEdit, turn }: UserTurnRowProps) => (
  <div ref={useRiseIn()}>
    <div className="group flex flex-col items-end gap-1.5">
      <div className="flex max-w-[80%] flex-col items-end gap-1.5">
        {turn.attachment === null ? null : <SentChip attachment={turn.attachment} />}
        {turn.text === "" ? null : (
          <div className="rounded-2xl rounded-br-md bg-composer-track px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-composer-ink">
            {turn.text}
          </div>
        )}
      </div>
      <ActionRow>
        <div className="flex items-center gap-0.5">
          <ActionButton label="Copy" name="copy" onClick={onCopy} />
          <ActionButton label="Edit" name="pencil" onClick={onEdit} />
        </div>
      </ActionRow>
    </div>
  </div>
);
