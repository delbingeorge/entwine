import { cn } from "@/shared/lib/cn";

interface ChipGroupProps {
  mode: "single" | "multi";
  onChange: (values: string[]) => void;
  options: readonly string[];
  values: string[];
}

export const ChipGroup = ({ mode, onChange, options, values }: ChipGroupProps) => {
  const toggle = (option: string) => {
    if (mode === "single") {
      onChange([option]);
      return;
    }

    onChange(
      values.includes(option) ? values.filter((value) => value !== option) : [...values, option],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = values.includes(option);

        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              isSelected
                ? "border-ink bg-ink text-surface"
                : "border-border bg-surface-raised text-ink hover:bg-surface-hover",
            )}
            key={option}
            onClick={() => {
              toggle(option);
            }}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};
