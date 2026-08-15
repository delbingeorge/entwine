import type { ReactNode } from "react";

import { LucideIcon, type LucideName } from "@/shared/components/lucide-icon";

interface ActionButtonProps {
  isFilled?: boolean;
  isHighlighted?: boolean;
  isPressed?: boolean;
  label: string;
  name: LucideName;
  onClick: () => void;
}

export const ActionButton = ({
  isFilled = false,
  isHighlighted = false,
  isPressed,
  label,
  name,
  onClick,
}: ActionButtonProps) => {
  const isActive = isHighlighted || isPressed === true;

  return (
    <button
      aria-label={label}
      aria-pressed={isPressed}
      className={`flex size-7 items-center justify-center rounded-md transition-colors hover:bg-composer-track hover:text-composer-ink ${
        isActive ? "bg-composer-track text-composer-ink" : "text-composer-soft"
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      <LucideIcon className={`size-3.5 ${isFilled ? "fill-current" : ""}`} name={name} />
    </button>
  );
};

interface ActionRowProps {
  children: ReactNode;
  className?: string;
}

export const ActionRow = ({ children, className }: ActionRowProps) => (
  <div
    className={`opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 ${className ?? ""}`}
  >
    {children}
  </div>
);
