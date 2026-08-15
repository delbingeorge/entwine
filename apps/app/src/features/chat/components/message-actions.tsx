import { LucideIcon, type LucideName } from "./lucide-icon";

interface ActionButtonProps {
  isPressed?: boolean;
  label: string;
  name: LucideName;
  onClick: () => void;
}

export const ActionButton = ({ isPressed, label, name, onClick }: ActionButtonProps) => (
  <button
    aria-label={label}
    aria-pressed={isPressed}
    className={`flex size-7 items-center justify-center rounded-md hover:bg-composer-track hover:text-composer-ink ${
      isPressed === true ? "bg-composer-track text-composer-ink" : "text-composer-soft"
    }`}
    onClick={onClick}
    title={label}
    type="button"
  >
    <LucideIcon className="size-3.5" name={name} />
  </button>
);

interface ActionRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ActionRow = ({ children, className }: ActionRowProps) => (
  <div
    className={`opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 ${className ?? ""}`}
  >
    {children}
  </div>
);
