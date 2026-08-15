import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";

import type { Icon } from "@solar-icons/react/lib/types";

interface SourceOptionProps {
  description: string;
  icon: Icon;
  label: string;
  onSelect: () => void;
}

export const SourceOption = ({ description, icon, label, onSelect }: SourceOptionProps) => {
  const OptionIcon = icon;

  return (
    <li>
      <button
        className="flex w-full items-center gap-3 rounded-md border border-border bg-surface-raised px-5 py-4 text-left shadow-xs transition-colors hover:bg-surface-hover"
        onClick={onSelect}
        type="button"
      >
        <OptionIcon className="shrink-0 text-ink-muted" />
        <span className="flex-1">
          <span className="block text-ink">{label}</span>
          <span className="block text-sm text-ink-muted">{description}</span>
        </span>
        <ArrowRightIcon className="shrink-0 text-ink-muted" size={18} />
      </button>
    </li>
  );
};
